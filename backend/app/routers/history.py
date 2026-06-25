"""History router - listing and managing request history."""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.history_service import HistoryService
from app.schemas.history import HistoryResponse, HistoryListResponse

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=List[HistoryListResponse])
def list_history(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    """List history entries, most recent first."""
    service = HistoryService(db)
    return service.get_all(limit=limit, offset=offset)


@router.get("/{history_id}", response_model=HistoryResponse)
def get_history_entry(history_id: str, db: Session = Depends(get_db)):
    """Get a single history entry with full details."""
    service = HistoryService(db)
    return service.get_by_id(history_id)


@router.delete("", status_code=200)
def clear_history(db: Session = Depends(get_db)):
    """Clear all history entries."""
    service = HistoryService(db)
    count = service.clear_all()
    return {"deleted": count}


@router.delete("/{history_id}", status_code=204)
def delete_history_entry(history_id: str, db: Session = Depends(get_db)):
    """Delete a single history entry."""
    service = HistoryService(db)
    service.delete(history_id)
