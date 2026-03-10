from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models import TimeBlock
from app.schemas.time_block import TimeBlockCreate, TimeBlockUpdate


def create_time_block(db: Session, block: TimeBlockCreate) -> TimeBlock:
    duration = TimeBlock.compute_duration(block.start_time, block.end_time)
    db_block = TimeBlock(
        domain=block.domain,
        title=block.title,
        start_time=block.start_time,
        end_time=block.end_time,
        duration_minutes=duration,
        notes=block.notes,
    )
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block


def get_time_blocks(
    db: Session,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    domain: str | None = None,
    limit: int = 200,
) -> list[TimeBlock]:
    q = db.query(TimeBlock).order_by(desc(TimeBlock.start_time))
    if start_date:
        q = q.filter(TimeBlock.start_time >= start_date)
    if end_date:
        q = q.filter(TimeBlock.start_time <= end_date)
    if domain:
        q = q.filter(TimeBlock.domain == domain)
    return q.limit(limit).all()


def get_time_block_by_id(db: Session, block_id: str):
    import uuid
    return db.query(TimeBlock).filter(TimeBlock.id == uuid.UUID(str(block_id))).first()
