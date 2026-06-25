"""Tabs router - managing open request tabs."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.tab_service import TabService
from app.schemas.tab import TabCreate, TabUpdate, TabResponse, TabReorderRequest

router = APIRouter(prefix="/tabs", tags=["Tabs"])


@router.get("", response_model=List[TabResponse])
def list_tabs(db: Session = Depends(get_db)):
    """Get all open tabs."""
    service = TabService(db)
    return service.get_all()


@router.post("", response_model=TabResponse, status_code=201)
def create_tab(data: TabCreate, db: Session = Depends(get_db)):
    """Open a new tab."""
    service = TabService(db)
    return service.create(data)


@router.patch("/{tab_id}", response_model=TabResponse)
def update_tab(tab_id: str, data: TabUpdate, db: Session = Depends(get_db)):
    """Update a tab's state."""
    service = TabService(db)
    return service.update(tab_id, data)


@router.delete("/{tab_id}", status_code=204)
def delete_tab(tab_id: str, db: Session = Depends(get_db)):
    """Close a tab."""
    service = TabService(db)
    service.delete(tab_id)


@router.post("/reorder", response_model=List[TabResponse])
def reorder_tabs(data: TabReorderRequest, db: Session = Depends(get_db)):
    """Reorder tabs."""
    service = TabService(db)
    return service.reorder(data)
