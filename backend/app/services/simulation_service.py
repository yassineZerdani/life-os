"""Simulation service - runs engine and persists results."""
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import SimulationRun, StrategyProtocol, StrategyLibraryItem, UserActiveProtocol
from app.services.life_simulation_engine import run_simulation
from app.services.life_state_builder import build_life_state


def run_and_save(
    db: Session,
    months_ahead: int,
    scenario_parameters: dict | None = None,
) -> SimulationRun:
    """Run simulation and persist result."""
    result = run_simulation(db, months_ahead, scenario_parameters or {})
    run = SimulationRun(
        months_ahead=months_ahead,
        scenario_parameters=scenario_parameters or {},
        result=result,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def get_history(db: Session, limit: int = 20) -> list[SimulationRun]:
    """Get recent simulation runs."""
    return (
        db.query(SimulationRun)
        .order_by(desc(SimulationRun.created_at))
        .limit(limit)
        .all()
    )


def get_simulation_context(db: Session) -> dict:
    """Get current life state summary, baseline rates, available protocols, and habits for the simulation UI."""
    state = build_life_state(db)
    active_protocol_ids = {s.protocol_id for s in state.active_strategies}
    available_protocols = []
    for prot in db.query(StrategyProtocol).all():
        strat = prot.strategy
        if not strat:
            continue
        if str(prot.id) in active_protocol_ids:
            continue
        available_protocols.append({
            "id": str(prot.id),
            "name": strat.name,
            "domain_key": strat.domain_key,
            "cadence": prot.cadence or "weekly",
        })
    habits = [
        {
            "action_template_id": h.action_template_id,
            "title": h.title,
            "domain": h.domain,
            "completions_per_week": h.completions_per_week,
            "xp_per_completion": h.xp_per_completion,
        }
        for h in state.habits
    ]
    return {
        "life_state_summary": {
            "domain_scores": {d: s.score for d, s in state.domain_scores.items()},
            "time_distribution": state.time_distribution,
            "habits_count": len(state.habits),
            "active_strategies_count": len(state.active_strategies),
            "goals_count": len(state.goals),
        },
        "baseline_rates": {k: v for k, v in state.baseline_rates.items() if not k.startswith("_")},
        "available_protocols": available_protocols,
        "habits": habits,
        "domains": state.domain_list(),
    }
