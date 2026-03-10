"""Finance profile — income, expenses, debts, assets, goals."""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class FinanceProfile(Base):
    __tablename__ = "finance_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    fixed_monthly_expenses = Column(Float, nullable=True)
    risk_tolerance = Column(String(50), nullable=True)
    budgeting_style = Column(String(50), nullable=True)
    emergency_fund_target = Column(Float, nullable=True)
    emergency_fund_currency = Column(String(10), nullable=True, default="USD")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    income_sources = relationship("IncomeSource", back_populates="finance_profile", cascade="all, delete-orphan")
    debts = relationship("DebtItem", back_populates="finance_profile", cascade="all, delete-orphan")
    assets = relationship("AssetItem", back_populates="finance_profile", cascade="all, delete-orphan")
    goals = relationship("FinanceGoal", back_populates="finance_profile", cascade="all, delete-orphan")


class IncomeSource(Base):
    __tablename__ = "income_sources"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(UUID(as_uuid=True), ForeignKey("finance_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    amount_monthly = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True, default="USD")
    is_variable = Column(Integer, nullable=True, default=0)
    finance_profile = relationship("FinanceProfile", back_populates="income_sources")


class DebtItem(Base):
    __tablename__ = "debt_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(UUID(as_uuid=True), ForeignKey("finance_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    balance = Column(Float, nullable=True)
    interest_rate = Column(Float, nullable=True)
    minimum_payment = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True, default="USD")
    finance_profile = relationship("FinanceProfile", back_populates="debts")


class AssetItem(Base):
    __tablename__ = "asset_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(UUID(as_uuid=True), ForeignKey("finance_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    asset_type = Column(String(50), nullable=True)
    value = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True, default="USD")
    finance_profile = relationship("FinanceProfile", back_populates="assets")


class FinanceGoal(Base):
    __tablename__ = "finance_goals"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finance_profile_id = Column(UUID(as_uuid=True), ForeignKey("finance_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    target_amount = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True, default="USD")
    target_date = Column(DateTime(timezone=True), nullable=True)
    finance_profile = relationship("FinanceProfile", back_populates="goals")
