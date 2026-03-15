"""Money Vault System schemas — wealth accounts, funding sources, vaults, ledger."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


# ----- Wealth Account -----
class WealthAccountResponse(BaseModel):
    id: UUID
    user_id: int
    account_type: str
    provider: str
    provider_account_id: Optional[str]
    currency: str
    available_balance: float
    locked_balance: float
    pending_balance: float
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Funding Source -----
class FundingSourceCreate(BaseModel):
    source_type: str  # bank_transfer, debit_card, credit_card
    label: str
    last4: Optional[str] = None
    brand: Optional[str] = None


class FundingSourceResponse(BaseModel):
    id: UUID
    user_id: int
    source_type: str
    provider: str
    provider_source_id: Optional[str]
    label: str
    last4: Optional[str]
    brand: Optional[str]
    active: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Wealth Vault -----
class WealthVaultCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: Optional[float] = None
    unlock_date: datetime
    vault_type: str = "soft"
    break_early_allowed: bool = False
    break_early_penalty_type: Optional[str] = None
    break_early_penalty_value: Optional[float] = None
    auto_unlock: bool = True
    currency: str = "USD"


class WealthVaultFundRequest(BaseModel):
    amount: float
    funding_source_id: Optional[UUID] = None


class WealthVaultResponse(BaseModel):
    id: UUID
    user_id: int
    wealth_account_id: UUID
    name: str
    description: Optional[str]
    vault_type: str
    target_amount: Optional[float]
    current_amount: float
    unlock_date: datetime
    lock_status: str
    break_early_allowed: int
    break_early_penalty_type: Optional[str]
    break_early_penalty_value: Optional[float]
    auto_unlock: int
    payout_destination_type: Optional[str]
    currency: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Vault Transaction -----
class VaultTransactionResponse(BaseModel):
    id: UUID
    vault_id: UUID
    transaction_type: str
    amount: float
    currency: str
    status: str
    source_type: Optional[str]
    source_id: Optional[str]
    notes: Optional[str]
    provider_reference: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Ledger Entry -----
class LedgerEntryResponse(BaseModel):
    id: UUID
    user_id: int
    wealth_account_id: UUID
    vault_id: Optional[UUID]
    entry_type: str
    amount: float
    balance_bucket: str
    direction: str
    reference_type: str
    reference_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Compliance -----
class ComplianceProfileCreate(BaseModel):
    kyc_status: Optional[str] = "not_started"
    risk_level: Optional[str] = None


class ComplianceProfileResponse(BaseModel):
    id: UUID
    user_id: int
    kyc_status: str
    risk_level: Optional[str]
    verification_provider: Optional[str]
    verification_reference: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Add funds to account (for MVP) -----
class AddFundsRequest(BaseModel):
    amount: float
    funding_source_id: Optional[UUID] = None
    currency: str = "USD"
