"""
Wealth domain: 50/30/20 budget, Money Vaults, Automated savings/investment.
All models are scoped to FinanceProfile (user).
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


# ----- 50/30/20 Budget -----

class BudgetCategory(Base):
    """System defaults: needs 50%, wants 30%, savings 20%."""
    __tablename__ = "budget_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(30), unique=True, nullable=False, index=True)
    label = Column(String(100), nullable=False)
    target_percentage = Column(Float, nullable=False)
    display_order = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BudgetAllocation(Base):
    """User override of target % per category (optional)."""
    __tablename__ = "budget_allocations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("finance_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_key = Column(String(30), nullable=False)
    target_percentage = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    finance_profile = relationship("FinanceProfile", backref="budget_allocations")


class Expense(Base):
    """Single expense tagged as needs, wants, or savings."""
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("finance_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=True, default="USD")
    category = Column(String(30), nullable=False)
    description = Column(String(500), nullable=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    finance_profile = relationship("FinanceProfile", backref="expenses")


class IncomeEntry(Base):
    """Recorded income event; triggers WealthAutomationEngine when created."""
    __tablename__ = "income_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("finance_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=True, default="USD")
    income_source_id = Column(
        UUID(as_uuid=True),
        ForeignKey("income_sources.id", ondelete="SET NULL"),
        nullable=True,
    )
    occurred_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    notes = Column(Text, nullable=True)
    automation_applied = Column(Integer, nullable=True, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    finance_profile = relationship("FinanceProfile", backref="income_entries")
    income_source = relationship("IncomeSource", backref="income_entries")


# ----- Money Vaults -----

class MoneyVault(Base):
    """Locked savings until unlock_date. Add-only until date."""
    __tablename__ = "money_vaults"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("finance_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, nullable=False, default=0)
    currency = Column(String(10), nullable=True, default="USD")
    unlock_date = Column(DateTime(timezone=True), nullable=False)
    allocation_key = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    finance_profile = relationship("FinanceProfile", backref="money_vaults")


# ----- Investment -----

class InvestmentStrategy(Base):
    """Named strategy: conservative, balanced, growth."""
    __tablename__ = "investment_strategies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("finance_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(50), nullable=False)
    label = Column(String(100), nullable=True)
    is_active = Column(Integer, nullable=True, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    finance_profile = relationship("FinanceProfile", backref="investment_strategies")
    allocations = relationship(
        "InvestmentAllocation",
        back_populates="strategy",
        cascade="all, delete-orphan",
    )


class InvestmentAllocation(Base):
    """Percentage of savings to allocate to each bucket (per strategy)."""
    __tablename__ = "investment_allocations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investment_strategy_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investment_strategies.id", ondelete="CASCADE"),
        nullable=False,
    )
    allocation_key = Column(String(50), nullable=False)
    label = Column(String(100), nullable=True)
    percentage = Column(Float, nullable=False)

    strategy = relationship("InvestmentStrategy", back_populates="allocations")


class InvestmentAccount(Base):
    """Bucket that receives auto-allocated savings (or manual)."""
    __tablename__ = "investment_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("finance_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(200), nullable=False)
    account_type = Column(String(50), nullable=True)
    allocation_key = Column(String(50), nullable=True)
    balance = Column(Float, nullable=False, default=0)
    currency = Column(String(10), nullable=True, default="USD")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    finance_profile = relationship("FinanceProfile", backref="investment_accounts")
