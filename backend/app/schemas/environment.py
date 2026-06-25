"""Pydantic schemas for Environment endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class EnvironmentVariableCreate(BaseModel):
    """Schema for creating an environment variable."""
    key: str = Field(..., min_length=1, max_length=255)
    value: str = ""
    enabled: bool = True


class EnvironmentVariableResponse(BaseModel):
    """Schema for environment variable API responses."""
    id: str
    key: str
    value: str
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnvironmentCreate(BaseModel):
    """Schema for creating an environment with initial variables."""
    name: str = Field(..., min_length=1, max_length=255)
    variables: Optional[List[EnvironmentVariableCreate]] = []


class EnvironmentUpdate(BaseModel):
    """Schema for updating an environment."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)


class EnvironmentResponse(BaseModel):
    """Schema for environment API responses."""
    id: str
    name: str
    is_active: bool
    variables: List[EnvironmentVariableResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnvironmentVariableBulkUpdate(BaseModel):
    """Schema for bulk updating environment variables."""
    variables: List[EnvironmentVariableCreate]
