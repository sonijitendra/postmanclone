"""Pydantic schemas for Proxy (send request) endpoint."""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ProxyKeyValue(BaseModel):
    """Key-value pair for proxy request."""
    key: str = ""
    value: str = ""
    enabled: bool = True


class ProxyAuth(BaseModel):
    """Authentication configuration for proxy request."""
    type: str = "none"  # none, bearer, basic
    token: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None


class ProxyBody(BaseModel):
    """Request body for proxy request."""
    type: str = "none"  # none, raw_json, raw_text, form_data, x_www_form_urlencoded
    content: Optional[str] = None
    form_data: Optional[List[ProxyKeyValue]] = None


class ProxySendRequest(BaseModel):
    """Schema for sending a request through the proxy."""
    method: str = "GET"
    url: str
    headers: Optional[List[ProxyKeyValue]] = []
    params: Optional[List[ProxyKeyValue]] = []
    body: Optional[ProxyBody] = None
    auth: Optional[ProxyAuth] = None
    environment_id: Optional[str] = None
    timeout: Optional[int] = None


class ProxySendResponse(BaseModel):
    """Schema for proxy response."""
    status_code: Optional[int] = None
    headers: Optional[Dict[str, str]] = None
    body: Optional[str] = None
    time_ms: Optional[float] = None
    size_bytes: Optional[int] = None
    error: Optional[str] = None
