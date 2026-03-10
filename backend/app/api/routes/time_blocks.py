from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.time_block import TimeBlockCreate, TimeBlockUpdate, TimeBlockResponse
from app.services.time_block_service import create_time_block, get_time_blocks, get_time_block_by_id

router = APIRouter()


@router.get("", response_model=list[TimeBlockResponse])
def list_time_blocks(
    start_date: str | None = Query(None, description="ISO date YYYY-MM-DD"),
    end_date: str | None = Query(None, description="ISO date YYYY-MM-DD"),
    domain: str | None = Query(None),
    limit: int = Query(200, le=500),
    db: Session = Depends(get_db),
):
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date + "T23:59:59") if end_date else None
    return get_time_blocks(db, start_dt, end_dt, domain, limit)


@router.post("", response_model=TimeBlockResponse)
def create_time_block_endpoint(block: TimeBlockCreate, db: Session = Depends(get_db)):
    return create_time_block(db, block)
