"""Pydantic schemas for History endpoints."""

from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


class HistoryResponse(BaseModel):
    """Schema for history API responses."""
    id: str
    method: str
    url: str
    request_headers: Optional[list] = None
    request_params: Optional[list] = None
    request_body: Optional[dict] = None
    body_type: str = "none"
    auth_type: str = "none"
    auth_data: Optional[dict] = None
    response_status: Optional[int] = None
    response_headers: Optional[Dict[str, str]] = None
    response_body: Optional[str] = None
    response_time_ms: Optional[float] = None
    response_size_bytes: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    """Schema for listing history entries (minimal info)."""
    id: str
    method: str
    url: str
    response_status: Optional[int] = None
    response_time_ms: Optional[float] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
