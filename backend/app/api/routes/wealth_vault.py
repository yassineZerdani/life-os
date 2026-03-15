"""Money Vault System API — wealth accounts, funding sources, vaults, ledger."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User
from app.models.money_vault import (
    WealthAccount,
    FundingSource,
    WealthVault,
    VaultTransaction,
    LedgerEntry,
    ComplianceProfile,
)
from app.schemas.money_vault import (
    WealthAccountResponse,
    FundingSourceCreate,
    FundingSourceResponse,
    WealthVaultCreate,
    WealthVaultFundRequest,
    WealthVaultResponse,
    VaultTransactionResponse,
    LedgerEntryResponse,
    ComplianceProfileCreate,
    ComplianceProfileResponse,
    AddFundsRequest,
)
from app.services.money_vault_service import (
    create_vault,
    fund_vault,
    lock_vault,
    unlock_vault,
    break_vault_early,
    add_funds_to_account,
    _get_or_create_wealth_account,
)
from app.services.vault_rules import get_rules_engine

router = APIRouter()


# ----- Wealth Accounts -----
@router.get("/accounts", response_model=list[WealthAccountResponse])
def list_wealth_accounts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List user's wealth accounts (wallet/balance)."""
    accounts = db.query(WealthAccount).filter(WealthAccount.user_id == user.id).all()
    return accounts


@router.post("/accounts", response_model=WealthAccountResponse)
def create_wealth_account(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create or get wealth account. Auto-creates if none exists."""
    acc = _get_or_create_wealth_account(db, user.id)
    return acc


@router.post("/accounts/add-funds", response_model=WealthAccountResponse)
def add_funds(
    body: AddFundsRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Add funds to available balance (MVP: simulated)."""
    try:
        acc = add_funds_to_account(db, user.id, body.amount, body.funding_source_id, body.currency)
        return acc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----- Funding Sources -----
@router.get("/funding-sources", response_model=list[FundingSourceResponse])
def list_funding_sources(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(FundingSource).filter(FundingSource.user_id == user.id).all()


@router.post("/funding-sources", response_model=FundingSourceResponse)
def create_funding_source(
    body: FundingSourceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fs = FundingSource(
        user_id=user.id,
        source_type=body.source_type,
        provider="mock",
        label=body.label,
        last4=body.last4,
        brand=body.brand,
        active=1,
    )
    db.add(fs)
    db.commit()
    db.refresh(fs)
    return fs


# ----- Vaults -----
@router.get("/vaults", response_model=list[WealthVaultResponse])
def list_wealth_vaults(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(WealthVault).filter(WealthVault.user_id == user.id).order_by(WealthVault.created_at.desc()).all()


@router.post("/vaults", response_model=WealthVaultResponse)
def create_wealth_vault(
    body: WealthVaultCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        vault = create_vault(
            db,
            user.id,
            name=body.name,
            unlock_date=body.unlock_date,
            target_amount=body.target_amount,
            description=body.description,
            vault_type=body.vault_type,
            break_early_allowed=body.break_early_allowed,
            break_early_penalty_type=body.break_early_penalty_type,
            break_early_penalty_value=body.break_early_penalty_value,
            auto_unlock=body.auto_unlock,
            currency=body.currency,
        )
        return vault
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/vaults/{vault_id}", response_model=WealthVaultResponse)
def get_wealth_vault(
    vault_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = db.query(WealthVault).filter(WealthVault.id == vault_id, WealthVault.user_id == user.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vault not found")
    return v


@router.get("/vaults/{vault_id}/eligibility")
def get_vault_eligibility(
    vault_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Check eligibility for fund, lock, unlock, break, payout. Returns reason codes for UX."""
    v = db.query(WealthVault).filter(WealthVault.id == vault_id, WealthVault.user_id == user.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vault not found")
    acc = db.query(WealthAccount).filter(WealthAccount.id == v.wealth_account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Wealth account not found")

    engine = get_rules_engine()
    return {
        "can_fund": engine.can_fund_vault(v, acc, 1, db=db).success,
        "can_lock": engine.can_lock_vault(v).success,
        "can_unlock": engine.can_unlock_vault(v).success,
        "can_break": engine.can_break_vault(v).success,
        "can_payout": engine.can_payout_vault(
            v, acc,
            v.current_amount if v.lock_status == "unlockable" else max(0.01, acc.available_balance),
        ).success,
    }


@router.post("/vaults/{vault_id}/fund", response_model=WealthVaultResponse)
def fund_wealth_vault(
    vault_id: UUID,
    body: WealthVaultFundRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        vault, _ = fund_vault(db, user.id, vault_id, body.amount, body.funding_source_id)
        return vault
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/vaults/{vault_id}/lock", response_model=WealthVaultResponse)
def lock_wealth_vault(
    vault_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        vault = lock_vault(db, user.id, vault_id)
        return vault
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/vaults/{vault_id}/unlock", response_model=WealthVaultResponse)
def unlock_wealth_vault(
    vault_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        vault = unlock_vault(db, user.id, vault_id)
        return vault
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/vaults/{vault_id}/break", response_model=WealthVaultResponse)
def break_wealth_vault(
    vault_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        vault = break_vault_early(db, user.id, vault_id)
        return vault
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/vaults/{vault_id}/payout")
def payout_wealth_vault(
    vault_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Payout unlocked funds to destination. Phase 2: requires payout_destination_id."""
    raise HTTPException(status_code=501, detail="Payout to external destination coming in Phase 2")


@router.get("/vaults/{vault_id}/transactions", response_model=list[VaultTransactionResponse])
def list_vault_transactions(
    vault_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = db.query(WealthVault).filter(WealthVault.id == vault_id, WealthVault.user_id == user.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vault not found")
    return db.query(VaultTransaction).filter(VaultTransaction.vault_id == vault_id).order_by(VaultTransaction.created_at.desc()).all()


# ----- Ledger -----
@router.get("/ledger", response_model=list[LedgerEntryResponse])
def get_wealth_ledger(
    vault_id: UUID | None = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(LedgerEntry).filter(LedgerEntry.user_id == user.id)
    if vault_id:
        q = q.filter(LedgerEntry.vault_id == vault_id)
    return q.order_by(LedgerEntry.created_at.desc()).limit(limit).all()


# ----- Compliance -----
@router.post("/compliance/profile", response_model=ComplianceProfileResponse)
def create_compliance_profile(
    body: ComplianceProfileCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing = db.query(ComplianceProfile).filter(ComplianceProfile.user_id == user.id).first()
    if existing:
        if body.kyc_status is not None:
            existing.kyc_status = body.kyc_status
        if body.risk_level is not None:
            existing.risk_level = body.risk_level
        db.commit()
        db.refresh(existing)
        return existing
    cp = ComplianceProfile(
        user_id=user.id,
        kyc_status=body.kyc_status or "not_started",
        risk_level=body.risk_level,
    )
    db.add(cp)
    db.commit()
    db.refresh(cp)
    return cp


# ----- Wealth widgets (for Control Room) -----
@router.get("/widgets")
def get_wealth_widgets(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Summary for Control Room: total vaulted, locked vs available, next unlock, etc."""
    acc = db.query(WealthAccount).filter(WealthAccount.user_id == user.id).first()
    vaults = db.query(WealthVault).filter(WealthVault.user_id == user.id).all()
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    total_vaulted = sum(float(v.current_amount) for v in vaults if v.lock_status in ("draft", "active", "locked"))
    locked = float(acc.locked_balance) if acc else 0
    available = float(acc.available_balance) if acc else 0
    next_unlock = None
    future_vaults = [v for v in vaults if v.lock_status == "locked" and v.unlock_date and v.current_amount > 0]
    for v in sorted(future_vaults, key=lambda x: x.unlock_date):
        ud = v.unlock_date.replace(tzinfo=timezone.utc) if v.unlock_date.tzinfo is None else v.unlock_date
        if ud >= now:
            next_unlock = {"vault_id": str(v.id), "vault_name": v.name, "date": v.unlock_date.isoformat(), "amount": v.current_amount}
            break
    emergency = next((v for v in vaults if "emergency" in v.name.lower()), None)
    emergency_progress = 0.0
    if emergency and emergency.target_amount and emergency.target_amount > 0:
        emergency_progress = min(100, (emergency.current_amount / emergency.target_amount) * 100)
    locked_count = sum(1 for v in vaults if v.lock_status == "locked")
    discipline = 100 if not vaults else min(100, 50 + (locked_count * 10) + (len([v for v in vaults if v.lock_status in ("unlocked", "withdrawn")]) * 5))
    return {
        "total_vaulted": round(total_vaulted, 2),
        "locked_balance": round(locked, 2),
        "available_balance": round(available, 2),
        "next_unlock": next_unlock,
        "emergency_fund_progress": round(emergency_progress, 1),
        "vault_discipline_score": min(100, round(discipline, 0)),
        "vault_count": len(vaults),
    }


@router.get("/compliance/profile", response_model=ComplianceProfileResponse | None)
def get_compliance_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cp = db.query(ComplianceProfile).filter(ComplianceProfile.user_id == user.id).first()
    return cp
