from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.metric import (
    MetricDefinitionCreate, MetricDefinitionUpdate, MetricDefinitionResponse,
    MetricEntryCreate, MetricEntryResponse
)
from app.services import metric_service

router = APIRouter()


@router.get("", response_model=list[MetricDefinitionResponse])
def list_metrics(
    domain: str | None = Query(None),
    db: Session = Depends(get_db)
):
    return metric_service.get_metrics(db, domain)


@router.get("/{metric_id}", response_model=MetricDefinitionResponse)
def get_metric(metric_id: str, db: Session = Depends(get_db)):
    metric = metric_service.get_metric_by_id(db, metric_id)
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    return metric


@router.post("", response_model=MetricDefinitionResponse)
def create_metric(metric: MetricDefinitionCreate, db: Session = Depends(get_db)):
    return metric_service.create_metric(db, metric)


@router.patch("/{metric_id}", response_model=MetricDefinitionResponse)
def update_metric(metric_id: str, metric: MetricDefinitionUpdate, db: Session = Depends(get_db)):
    result = metric_service.update_metric(db, metric_id, metric)
    if not result:
        raise HTTPException(status_code=404, detail="Metric not found")
    return result


@router.get("/{metric_id}/entries", response_model=list[MetricEntryResponse])
def list_metric_entries(
    metric_id: str,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    return metric_service.get_metric_entries(db, metric_id, limit)


@router.post("/entries", response_model=MetricEntryResponse)
def add_metric_entry(entry: MetricEntryCreate, db: Session = Depends(get_db)):
    return metric_service.add_metric_entry(db, entry)
