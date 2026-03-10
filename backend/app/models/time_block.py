from sqlalchemy import Column, String, Float, DateTime, Text, event
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class TimeBlock(Base):
    __tablename__ = "time_blocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain = Column(String(50), index=True)
    title = Column(String(200))
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration_minutes = Column(Float)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def compute_duration(start_time, end_time):
        if start_time and end_time:
            delta = end_time - start_time
            return delta.total_seconds() / 60
        return 0


@event.listens_for(TimeBlock, 'before_insert')
@event.listens_for(TimeBlock, 'before_update')
def compute_duration_before_save(mapper, connection, target):
    if target.start_time and target.end_time:
        target.duration_minutes = TimeBlock.compute_duration(target.start_time, target.end_time)
