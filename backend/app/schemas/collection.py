"""Pydantic schemas for Collection endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CollectionCreate(BaseModel):
    """Schema for creating a new collection."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class CollectionUpdate(BaseModel):
    """Schema for updating an existing collection."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    sort_order: Optional[int] = None


class RequestInCollection(BaseModel):
    """Schema for a request nested within a collection response."""
    id: str
    name: str
    method: str
    url: str
    headers: Optional[list] = []
    params: Optional[list] = []
    body: Optional[dict] = None
    body_type: str = "none"
    auth_type: str = "none"
    auth_data: Optional[dict] = None
    sort_order: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CollectionResponse(BaseModel):
    """Schema for collection API responses."""
    id: str
    name: str
    description: Optional[str] = None
    sort_order: int = 0
    requests: List[RequestInCollection] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CollectionListResponse(BaseModel):
    """Schema for listing collections (without full request details)."""
    id: str
    name: str
    description: Optional[str] = None
    sort_order: int = 0
    request_count: int = 0
    created_at: datetime
    updated_at: datetime
