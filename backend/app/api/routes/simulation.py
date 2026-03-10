from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.simulation import SimulationRunRequest, SimulationRunResponse, SimulationResult
from app.services import simulation_service

router = APIRouter()


@router.post("/run", response_model=SimulationResult)
def run_simulation(
    body: SimulationRunRequest,
    db: Session = Depends(get_db),
):
    """Run future life simulation and return predicted domain scores and levels."""
    run = simulation_service.run_and_save(
        db,
        months_ahead=body.months,
        scenario_parameters=body.scenario,
    )
    return run.result


@router.get("/history", response_model=list[SimulationRunResponse])
def get_simulation_history(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Return previous simulation runs."""
    return simulation_service.get_history(db, limit=limit)


@router.get("/context")
def get_simulation_context(db: Session = Depends(get_db)):
    """Return life state summary, baseline rates, available protocols, and habits for the simulation UI."""
    return simulation_service.get_simulation_context(db)
