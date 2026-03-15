"""Wealth API schemas — budget, expenses, vaults, investments, dashboard."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


# ----- Budget -----
class BudgetCategoryResponse(BaseModel):
    id: UUID
    key: str
    label: str
    target_percentage: float
    display_order: Optional[int] = None

    class Config:
        from_attributes = True


class BudgetAllocationCreate(BaseModel):
    category_key: str
    target_percentage: float


class BudgetAllocationResponse(BaseModel):
    id: UUID
    finance_profile_id: UUID
    category_key: str
    target_percentage: float

    class Config:
        from_attributes = True


# ----- Expenses -----
class ExpenseCreate(BaseModel):
    amount: float
    currency: Optional[str] = "USD"
    category: str  # needs, wants, savings
    description: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: UUID
    finance_profile_id: UUID
    amount: float
    currency: Optional[str]
    category: str
    description: Optional[str]
    occurred_at: datetime

    class Config:
        from_attributes = True


# ----- Income -----
class IncomeEntryCreate(BaseModel):
    amount: float
    currency: Optional[str] = "USD"
    income_source_id: Optional[UUID] = None
    notes: Optional[str] = None


class IncomeEntryResponse(BaseModel):
    id: UUID
    finance_profile_id: UUID
    amount: float
    currency: Optional[str]
    income_source_id: Optional[UUID]
    occurred_at: datetime
    automation_applied: Optional[int]

    class Config:
        from_attributes = True


# ----- Vaults -----
class MoneyVaultCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: float
    currency: Optional[str] = "USD"
    unlock_date: datetime
    allocation_key: Optional[str] = None


class MoneyVaultUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = None
    unlock_date: Optional[datetime] = None


class MoneyVaultAddRequest(BaseModel):
    amount: float


class MoneyVaultResponse(BaseModel):
    id: UUID
    finance_profile_id: UUID
    name: str
    description: Optional[str]
    target_amount: float
    current_amount: float
    currency: Optional[str]
    unlock_date: datetime
    allocation_key: Optional[str]

    class Config:
        from_attributes = True


# ----- Investment -----
class InvestmentAllocationCreate(BaseModel):
    allocation_key: str
    label: Optional[str] = None
    percentage: float


class InvestmentStrategyCreate(BaseModel):
    name: str
    label: Optional[str] = None
    allocations: list[InvestmentAllocationCreate]


class InvestmentStrategyResponse(BaseModel):
    id: UUID
    finance_profile_id: UUID
    name: str
    label: Optional[str]
    is_active: Optional[int]
    allocations: list[dict]

    class Config:
        from_attributes = True


class InvestmentAccountCreate(BaseModel):
    name: str
    account_type: Optional[str] = None
    allocation_key: Optional[str] = None
    currency: Optional[str] = "USD"


class InvestmentAccountResponse(BaseModel):
    id: UUID
    finance_profile_id: UUID
    name: str
    account_type: Optional[str]
    allocation_key: Optional[str]
    balance: float
    currency: Optional[str]

    class Config:
        from_attributes = True


# ----- Dashboard -----
class BudgetDistributionItem(BaseModel):
    category_key: str
    label: str
    target_percentage: float
    spent_amount: float
    spent_percentage: float
    is_over: bool


class WealthDashboardResponse(BaseModel):
    net_worth: Optional[float] = None
    total_income_this_month: Optional[float] = None
    budget_distribution: list[BudgetDistributionItem] = []
    vaults: list[MoneyVaultResponse] = []
    investment_accounts: list[InvestmentAccountResponse] = []
    active_strategy: Optional[InvestmentStrategyResponse] = None
