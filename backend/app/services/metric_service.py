import uuid
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import MetricDefinition, MetricEntry
from app.schemas.metric import MetricDefinitionCreate, MetricDefinitionUpdate, MetricEntryCreate


def _to_uuid(val):
    return uuid.UUID(str(val)) if val else None


def get_metrics(db: Session, domain: str | None = None):
    q = db.query(MetricDefinition)
    if domain:
        q = q.filter(MetricDefinition.domain == domain)
    return q.all()


def get_metric_by_id(db: Session, metric_id):
    return db.query(MetricDefinition).filter(MetricDefinition.id == _to_uuid(metric_id)).first()


def create_metric(db: Session, metric: MetricDefinitionCreate):
    db_metric = MetricDefinition(**metric.model_dump())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric


def update_metric(db: Session, metric_id: str, metric: MetricDefinitionUpdate):
    db_metric = get_metric_by_id(db, metric_id)
    if not db_metric:
        return None
    update_data = metric.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_metric, key, value)
    db.commit()
    db.refresh(db_metric)
    return db_metric


def get_metric_entries(db: Session, metric_id: str, limit: int = 100):
    return (
        db.query(MetricEntry)
        .filter(MetricEntry.metric_id == _to_uuid(metric_id))
        .order_by(desc(MetricEntry.timestamp))
        .limit(limit)
        .all()
    )


def add_metric_entry(db: Session, entry: MetricEntryCreate):
    data = entry.model_dump()
    data["metric_id"] = _to_uuid(data["metric_id"])
    db_entry = MetricEntry(**data)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
