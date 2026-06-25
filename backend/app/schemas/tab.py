"""Pydantic schemas for Tab endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TabCreate(BaseModel):
    """Schema for opening a new tab."""
    request_id: Optional[str] = None
    history_id: Optional[str] = None
    tab_type: str = "new"  # new, saved, history
    title: str = "Untitled Request"
    unsaved_state: Optional[dict] = None
    is_active: bool = True


class TabUpdate(BaseModel):
    """Schema for updating a tab."""
    title: Optional[str] = None
    unsaved_state: Optional[dict] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    request_id: Optional[str] = None
    tab_type: Optional[str] = None


class TabResponse(BaseModel):
    """Schema for tab API responses."""
    id: str
    request_id: Optional[str] = None
    history_id: Optional[str] = None
    tab_type: str
    title: str
    unsaved_state: Optional[dict] = None
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TabReorderRequest(BaseModel):
    """Schema for reordering tabs."""
    tab_ids: List[str] = Field(..., description="Ordered list of tab IDs")
