"""Pydantic schemas for Request endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class KeyValuePair(BaseModel):
    """A key-value pair with an enabled toggle (for headers, params, form data)."""
    key: str = ""
    value: str = ""
    enabled: bool = True
    description: str = ""


class RequestBody(BaseModel):
    """Request body configuration."""
    type: str = "none"  # none, raw_json, raw_text, form_data, x_www_form_urlencoded
    content: Optional[str] = None
    form_data: Optional[List[KeyValuePair]] = None


class RequestCreate(BaseModel):
    """Schema for saving a new request to a collection."""
    name: str = Field(..., min_length=1, max_length=255)
    method: str = Field(default="GET", pattern="^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$")
    url: str = ""
    headers: Optional[List[KeyValuePair]] = []
    params: Optional[List[KeyValuePair]] = []
    body: Optional[RequestBody] = None
    body_type: str = "none"
    auth_type: str = "none"
    auth_data: Optional[dict] = None
    sort_order: int = 0


class RequestUpdate(BaseModel):
    """Schema for updating a saved request."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    method: Optional[str] = Field(None, pattern="^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$")
    url: Optional[str] = None
    headers: Optional[List[KeyValuePair]] = None
    params: Optional[List[KeyValuePair]] = None
    body: Optional[RequestBody] = None
    body_type: Optional[str] = None
    auth_type: Optional[str] = None
    auth_data: Optional[dict] = None
    sort_order: Optional[int] = None


class RequestResponse(BaseModel):
    """Schema for request API responses."""
    id: str
    collection_id: str
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
