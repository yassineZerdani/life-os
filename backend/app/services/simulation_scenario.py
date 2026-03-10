"""
Scenario — user-defined changes to apply during simulation.
"""
from dataclasses import dataclass, field
from typing import Any


@dataclass
class SimulationScenario:
    """Scenario adjustments applied on top of baseline life state."""
    # Strategy: list of protocol IDs to "activate" in sim (adds XP + time to domain)
    activate_strategy: list[str] = field(default_factory=list)  # protocol_id UUIDs
    # Habit: action_template_id -> completions per week (overrides baseline)
    increase_habit_frequency: dict[str, float] = field(default_factory=dict)  # template_id -> per_week
    # Behavior: action_template_id -> multiplier 0..1 (reduce this habit)
    reduce_behavior: dict[str, float] = field(default_factory=dict)  # template_id -> 0.0-1.0
    # Time: domain -> delta hours per week (added to baseline)
    change_time_allocation: dict[str, float] = field(default_factory=dict)  # domain -> delta hours

    @classmethod
    def from_dict(cls, d: dict[str, Any] | None) -> "SimulationScenario":
        if not d:
            return cls()
        return cls(
            activate_strategy=list(d.get("activate_strategy") or []),
            increase_habit_frequency=dict(d.get("increase_habit_frequency") or {}),
            reduce_behavior=dict(d.get("reduce_behavior") or {}),
            change_time_allocation=dict(d.get("change_time_allocation") or {}),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "activate_strategy": self.activate_strategy,
            "increase_habit_frequency": self.increase_habit_frequency,
            "reduce_behavior": self.reduce_behavior,
            "change_time_allocation": self.change_time_allocation,
        }
