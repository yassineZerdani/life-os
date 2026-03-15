"""Wealth API — budget 50/30/20, expenses, income entries, vaults, investment strategies and accounts."""
from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.api.routes.wealth_vault import router as wealth_vault_router
from app.models import User
from app.models import (
    FinanceProfile,
    IncomeSource,
    IncomeEntry,
    Expense,
    BudgetCategory,
    BudgetAllocation,
    MoneyVault,
    InvestmentStrategy,
    InvestmentAllocation,
    InvestmentAccount,
)
from app.schemas.wealth import (
    BudgetCategoryResponse,
    BudgetAllocationCreate,
    BudgetAllocationResponse,
    ExpenseCreate,
    ExpenseResponse,
    IncomeEntryCreate,
    IncomeEntryResponse,
    MoneyVaultCreate,
    MoneyVaultUpdate,
    MoneyVaultAddRequest,
    MoneyVaultResponse,
    InvestmentStrategyCreate,
    InvestmentStrategyResponse,
    InvestmentAllocationCreate,
    InvestmentAccountCreate,
    InvestmentAccountResponse,
    WealthDashboardResponse,
    BudgetDistributionItem,
)
from app.services.profile_service import get_or_create_finance_profile
from app.services.wealth_automation_engine import run_on_income_entry

router = APIRouter()

# Include Money Vault System routes (accounts, funding-sources, vaults, ledger, compliance)
router.include_router(wealth_vault_router)


def _get_finance_profile(db: Session, user: User) -> FinanceProfile:
    return get_or_create_finance_profile(db, user.id)


# ----- Budget categories (system) -----
@router.get("/budget-categories", response_model=list[BudgetCategoryResponse])
def list_budget_categories(db: Session = Depends(get_db)):
    """System default categories: needs 50%, wants 30%, savings 20%."""
    items = db.query(BudgetCategory).order_by(BudgetCategory.display_order).all()
    return items


# ----- Budget allocations (user overrides) -----
@router.get("/budget-allocations", response_model=list[BudgetAllocationResponse])
def list_budget_allocations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    return db.query(BudgetAllocation).filter(BudgetAllocation.finance_profile_id == fp.id).all()


@router.post("/budget-allocations", response_model=BudgetAllocationResponse)
def upsert_budget_allocation(
    body: BudgetAllocationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    existing = (
        db.query(BudgetAllocation)
        .filter(
            BudgetAllocation.finance_profile_id == fp.id,
            BudgetAllocation.category_key == body.category_key,
        )
        .first()
    )
    if existing:
        existing.target_percentage = body.target_percentage
        db.commit()
        db.refresh(existing)
        return existing
    row = BudgetAllocation(
        finance_profile_id=fp.id,
        category_key=body.category_key,
        target_percentage=body.target_percentage,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# ----- Expenses -----
@router.get("/expenses", response_model=list[ExpenseResponse])
def list_expenses(
    category: str | None = None,
    month: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    q = db.query(Expense).filter(Expense.finance_profile_id == fp.id)
    if category:
        q = q.filter(Expense.category == category)
    if month:
        q = q.filter(func.date_trunc("month", Expense.occurred_at) == month)
    return q.order_by(Expense.occurred_at.desc()).limit(500).all()


@router.post("/expenses", response_model=ExpenseResponse)
def create_expense(
    body: ExpenseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    if body.category not in ("needs", "wants", "savings"):
        raise HTTPException(status_code=400, detail="category must be needs, wants, or savings")
    row = Expense(
        finance_profile_id=fp.id,
        amount=body.amount,
        currency=body.currency,
        category=body.category,
        description=body.description,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# ----- Income entries (triggers automation) -----
@router.get("/income-entries", response_model=list[IncomeEntryResponse])
def list_income_entries(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    return db.query(IncomeEntry).filter(IncomeEntry.finance_profile_id == fp.id).order_by(IncomeEntry.occurred_at.desc()).limit(100).all()


@router.post("/income-entries", response_model=IncomeEntryResponse)
def create_income_entry(
    body: IncomeEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    row = IncomeEntry(
        finance_profile_id=fp.id,
        amount=body.amount,
        currency=body.currency,
        income_source_id=body.income_source_id,
        notes=body.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    run_on_income_entry(db, row)
    return row


# ----- Income sources (from profile) -----
@router.get("/income-sources")
def list_income_sources(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    sources = db.query(IncomeSource).filter(IncomeSource.finance_profile_id == fp.id).all()
    return [{"id": str(s.id), "name": s.name, "amount_monthly": s.amount_monthly, "currency": s.currency} for s in sources]


# ----- Legacy money vaults (finance_profile; used by automation) -----
@router.get("/savings-vaults", response_model=list[MoneyVaultResponse])
def list_savings_vaults(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    return db.query(MoneyVault).filter(MoneyVault.finance_profile_id == fp.id).order_by(MoneyVault.created_at).all()


@router.post("/savings-vaults", response_model=MoneyVaultResponse)
def create_savings_vault(
    body: MoneyVaultCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    row = MoneyVault(
        finance_profile_id=fp.id,
        name=body.name,
        description=body.description,
        target_amount=body.target_amount,
        current_amount=0,
        currency=body.currency,
        unlock_date=body.unlock_date,
        allocation_key=body.allocation_key,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/savings-vaults/{vault_id}", response_model=MoneyVaultResponse)
def get_savings_vault(
    vault_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    v = db.query(MoneyVault).filter(MoneyVault.id == vault_id, MoneyVault.finance_profile_id == fp.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vault not found")
    return v


@router.patch("/savings-vaults/{vault_id}", response_model=MoneyVaultResponse)
def update_savings_vault(
    vault_id: UUID,
    body: MoneyVaultUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    v = db.query(MoneyVault).filter(MoneyVault.id == vault_id, MoneyVault.finance_profile_id == fp.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vault not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return v


@router.post("/savings-vaults/{vault_id}/add", response_model=MoneyVaultResponse)
def add_to_savings_vault(
    vault_id: UUID,
    body: MoneyVaultAddRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    v = db.query(MoneyVault).filter(MoneyVault.id == vault_id, MoneyVault.finance_profile_id == fp.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vault not found")
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    v.current_amount = (v.current_amount or 0) + body.amount
    db.commit()
    db.refresh(v)
    return v


# ----- Investment strategies -----
@router.get("/strategies", response_model=list[InvestmentStrategyResponse])
def list_strategies(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    strategies = db.query(InvestmentStrategy).filter(InvestmentStrategy.finance_profile_id == fp.id).all()
    result = []
    for s in strategies:
        allocs = db.query(InvestmentAllocation).filter(InvestmentAllocation.investment_strategy_id == s.id).all()
        result.append(
            InvestmentStrategyResponse(
                id=s.id,
                finance_profile_id=s.finance_profile_id,
                name=s.name,
                label=s.label,
                is_active=s.is_active,
                allocations=[{"allocation_key": a.allocation_key, "label": a.label, "percentage": a.percentage} for a in allocs],
            )
        )
    return result


@router.post("/strategies", response_model=InvestmentStrategyResponse)
def create_strategy(
    body: InvestmentStrategyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    s = InvestmentStrategy(
        finance_profile_id=fp.id,
        name=body.name,
        label=body.label,
        is_active=0,
    )
    db.add(s)
    db.flush()
    for a in body.allocations:
        db.add(
            InvestmentAllocation(
                investment_strategy_id=s.id,
                allocation_key=a.allocation_key,
                label=a.label,
                percentage=a.percentage,
            )
        )
    db.commit()
    db.refresh(s)
    allocs = db.query(InvestmentAllocation).filter(InvestmentAllocation.investment_strategy_id == s.id).all()
    return InvestmentStrategyResponse(
        id=s.id,
        finance_profile_id=s.finance_profile_id,
        name=s.name,
        label=s.label,
        is_active=s.is_active,
        allocations=[{"allocation_key": a.allocation_key, "label": a.label, "percentage": a.percentage} for a in allocs],
    )


@router.post("/strategies/{strategy_id}/activate", response_model=InvestmentStrategyResponse)
def activate_strategy(
    strategy_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    s = db.query(InvestmentStrategy).filter(
        InvestmentStrategy.id == strategy_id,
        InvestmentStrategy.finance_profile_id == fp.id,
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    db.query(InvestmentStrategy).filter(InvestmentStrategy.finance_profile_id == fp.id).update({"is_active": 0})
    s.is_active = 1
    db.commit()
    db.refresh(s)
    allocs = db.query(InvestmentAllocation).filter(InvestmentAllocation.investment_strategy_id == s.id).all()
    return InvestmentStrategyResponse(
        id=s.id,
        finance_profile_id=s.finance_profile_id,
        name=s.name,
        label=s.label,
        is_active=s.is_active,
        allocations=[{"allocation_key": a.allocation_key, "label": a.label, "percentage": a.percentage} for a in allocs],
    )


# ----- Investment accounts -----
@router.get("/investment-accounts", response_model=list[InvestmentAccountResponse])
def list_investment_accounts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    return db.query(InvestmentAccount).filter(InvestmentAccount.finance_profile_id == fp.id).all()


@router.post("/investment-accounts", response_model=InvestmentAccountResponse)
def create_investment_account(
    body: InvestmentAccountCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    row = InvestmentAccount(
        finance_profile_id=fp.id,
        name=body.name,
        account_type=body.account_type,
        allocation_key=body.allocation_key,
        balance=0,
        currency=body.currency,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# ----- Dashboard -----
@router.get("/dashboard", response_model=WealthDashboardResponse)
def get_wealth_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fp = _get_finance_profile(db, user)
    from datetime import datetime
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Net worth: assets - debts (from profile)
    from app.models import AssetItem, DebtItem
    from app.models.money_vault import WealthAccount, WealthVault
    total_assets = db.query(func.coalesce(func.sum(AssetItem.value), 0)).filter(AssetItem.finance_profile_id == fp.id).scalar() or 0
    total_debts = db.query(func.coalesce(func.sum(DebtItem.balance), 0)).filter(DebtItem.finance_profile_id == fp.id).scalar() or 0
    vault_total = db.query(func.coalesce(func.sum(MoneyVault.current_amount), 0)).filter(MoneyVault.finance_profile_id == fp.id).scalar() or 0
    account_total = db.query(func.coalesce(func.sum(InvestmentAccount.balance), 0)).filter(InvestmentAccount.finance_profile_id == fp.id).scalar() or 0
    # New Money Vault System: wealth account balances
    wealth_acc = db.query(WealthAccount).filter(WealthAccount.user_id == user.id).first()
    wealth_total = 0.0
    if wealth_acc:
        wealth_total = float(wealth_acc.available_balance) + float(wealth_acc.locked_balance) + float(wealth_acc.pending_balance)
    net_worth = float(total_assets) - float(total_debts) + float(vault_total) + float(account_total) + wealth_total

    # Income this month
    total_income = db.query(func.coalesce(func.sum(IncomeEntry.amount), 0)).filter(
        IncomeEntry.finance_profile_id == fp.id,
        IncomeEntry.occurred_at >= month_start,
    ).scalar() or 0

    # Budget distribution: target % vs spent % this month
    categories = db.query(BudgetCategory).order_by(BudgetCategory.display_order).all()
    default_cats = [
        ("needs", "Needs", 50.0),
        ("wants", "Wants", 30.0),
        ("savings", "Savings", 20.0),
    ]
    if not categories:
        categories = default_cats
    else:
        categories = [(c.key, c.label, float(c.target_percentage)) for c in categories]
    allocations = {a.category_key: float(a.target_percentage) for a in db.query(BudgetAllocation).filter(BudgetAllocation.finance_profile_id == fp.id).all()}
    distribution = []
    total_spent = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
        Expense.finance_profile_id == fp.id,
        Expense.occurred_at >= month_start,
    ).scalar() or 0
    total_spent = float(total_spent)
    for cat in categories:
        if isinstance(cat, tuple):
            c_key, c_label, pct_target = cat
        else:
            c_key, c_label, pct_target = cat.key, cat.label, float(cat.target_percentage)
        pct_target = float(allocations.get(c_key, pct_target))
        spent = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
            Expense.finance_profile_id == fp.id,
            Expense.category == c_key,
            Expense.occurred_at >= month_start,
        ).scalar() or 0
        spent = float(spent)
        spent_pct = (spent / total_income * 100) if total_income else 0
        distribution.append(
            BudgetDistributionItem(
                category_key=c_key,
                label=c_label,
                target_percentage=pct_target,
                spent_amount=spent,
                spent_percentage=round(spent_pct, 1),
                is_over=spent_pct > pct_target,
            )
        )

    vaults = db.query(MoneyVault).filter(MoneyVault.finance_profile_id == fp.id).order_by(MoneyVault.created_at).all()
    accounts = db.query(InvestmentAccount).filter(InvestmentAccount.finance_profile_id == fp.id).all()
    active = db.query(InvestmentStrategy).filter(
        InvestmentStrategy.finance_profile_id == fp.id,
        InvestmentStrategy.is_active == 1,
    ).first()
    active_resp = None
    if active:
        allocs = db.query(InvestmentAllocation).filter(InvestmentAllocation.investment_strategy_id == active.id).all()
        active_resp = InvestmentStrategyResponse(
            id=active.id,
            finance_profile_id=active.finance_profile_id,
            name=active.name,
            label=active.label,
            is_active=active.is_active,
            allocations=[{"allocation_key": a.allocation_key, "label": a.label, "percentage": a.percentage} for a in allocs],
        )

    return WealthDashboardResponse(
        net_worth=round(net_worth, 2),
        total_income_this_month=round(float(total_income), 2),
        budget_distribution=distribution,
        vaults=vaults,
        investment_accounts=accounts,
        active_strategy=active_resp,
    )
