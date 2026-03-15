"""
Break-early penalty calculation.
Deterministic, auditable.
"""
from dataclasses import dataclass
from typing import Any

PENALTY_NONE = "none"
PENALTY_PERCENTAGE = "percentage"
PENALTY_FIXED = "fixed"
PENALTY_FORFEITED_REWARDS = "forfeited_rewards"  # placeholder for future


@dataclass
class BreakPenaltyResult:
    gross_amount: float
    penalty_amount: float
    net_unlockable_amount: float
    penalty_type: str
    penalty_value: float | None


class VaultPenaltyService:
    """Calculates break-early penalties."""

    def calculate_break_penalty(self, vault: Any, amount: float) -> BreakPenaltyResult:
        """
        Calculate penalty for breaking vault early.
        Returns gross, penalty, net.
        """
        penalty_type = getattr(vault, "break_early_penalty_type", None) or PENALTY_NONE
        penalty_value = getattr(vault, "break_early_penalty_value", None)

        penalty = 0.0
        if penalty_type == PENALTY_PERCENTAGE and penalty_value is not None:
            penalty = amount * (penalty_value / 100)
        elif penalty_type == PENALTY_FIXED and penalty_value is not None:
            penalty = min(penalty_value, amount)
        elif penalty_type == PENALTY_FORFEITED_REWARDS:
            penalty = 0.0  # Placeholder

        net = max(0.0, amount - penalty)
        return BreakPenaltyResult(
            gross_amount=amount,
            penalty_amount=penalty,
            net_unlockable_amount=net,
            penalty_type=penalty_type,
            penalty_value=penalty_value,
        )
