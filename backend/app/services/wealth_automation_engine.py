"""
Wealth Automation Engine — runs when income is added.
Steps: detect income → apply 50/30/20 → allocate savings → update vaults → distribute investments.
"""
from sqlalchemy.orm import Session
from decimal import Decimal
from app.models import (
    FinanceProfile,
    IncomeEntry,
    Expense,
    BudgetCategory,
    BudgetAllocation,
    MoneyVault,
    InvestmentStrategy,
    InvestmentAllocation,
    InvestmentAccount,
)


# Default 50/30/20 if no user allocation
DEFAULT_NEEDS_PCT = 50.0
DEFAULT_WANTS_PCT = 30.0
DEFAULT_SAVINGS_PCT = 20.0


def _get_target_percentages(db: Session, finance_profile_id) -> dict[str, float]:
    """Returns {needs: 50, wants: 30, savings: 20} or user overrides."""
    allocations = (
        db.query(BudgetAllocation)
        .filter(BudgetAllocation.finance_profile_id == finance_profile_id)
        .all()
    )
    if allocations:
        return {a.category_key: float(a.target_percentage) for a in allocations}
    categories = db.query(BudgetCategory).order_by(BudgetCategory.display_order).all()
    if categories:
        return {c.key: float(c.target_percentage) for c in categories}
    return {"needs": DEFAULT_NEEDS_PCT, "wants": DEFAULT_WANTS_PCT, "savings": DEFAULT_SAVINGS_PCT}


def _get_active_strategy(db: Session, finance_profile_id):
    return (
        db.query(InvestmentStrategy)
        .filter(
            InvestmentStrategy.finance_profile_id == finance_profile_id,
            InvestmentStrategy.is_active == 1,
        )
        .first()
    )


def run_on_income_entry(db: Session, entry: IncomeEntry) -> dict:
    """
    Run full automation for one income entry.
    - Applies 50/30/20 split (creates logical allocation; optional Expense records for needs/wants).
    - Adds savings portion to vaults and investment accounts per active strategy.
    """
    if entry.automation_applied:
        return {"status": "already_applied", "entry_id": str(entry.id)}

    profile_id = entry.finance_profile_id
    amount = float(entry.amount)
    currency = entry.currency or "USD"

    # 1) Target percentages
    pcts = _get_target_percentages(db, profile_id)
    needs_pct = pcts.get("needs", DEFAULT_NEEDS_PCT) / 100.0
    wants_pct = pcts.get("wants", DEFAULT_WANTS_PCT) / 100.0
    savings_pct = pcts.get("savings", DEFAULT_SAVINGS_PCT) / 100.0

    needs_amount = round(amount * needs_pct, 2)
    wants_amount = round(amount * wants_pct, 2)
    savings_amount = round(amount * savings_pct, 2)

    # 2) Allocate savings: vaults + investment accounts from active strategy
    strategy = _get_active_strategy(db, profile_id)
    if strategy and savings_amount > 0:
        allocs = (
            db.query(InvestmentAllocation)
            .filter(InvestmentAllocation.investment_strategy_id == strategy.id)
            .all()
        )
        for a in allocs:
            pct = float(a.percentage) / 100.0
            add_amount = round(savings_amount * pct, 2)
            if add_amount <= 0:
                continue
            # Prefer vault with this allocation_key
            vault = (
                db.query(MoneyVault)
                .filter(
                    MoneyVault.finance_profile_id == profile_id,
                    MoneyVault.allocation_key == a.allocation_key,
                )
                .first()
            )
            if vault:
                vault.current_amount = (vault.current_amount or 0) + add_amount
                continue
            # Else investment account with this allocation_key
            acct = (
                db.query(InvestmentAccount)
                .filter(
                    InvestmentAccount.finance_profile_id == profile_id,
                    InvestmentAccount.allocation_key == a.allocation_key,
                )
                .first()
            )
            if acct:
                acct.balance = (acct.balance or 0) + add_amount

    # 3) Mark entry as processed
    entry.automation_applied = 1
    db.commit()
    db.refresh(entry)

    return {
        "status": "applied",
        "entry_id": str(entry.id),
        "needs_amount": needs_amount,
        "wants_amount": wants_amount,
        "savings_amount": savings_amount,
    }
