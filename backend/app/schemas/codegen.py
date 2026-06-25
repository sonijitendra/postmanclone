"""Pydantic schemas for code generation endpoints."""

from pydantic import BaseModel
from typing import Optional, List


class CodegenKeyValue(BaseModel):
    """Key-value pair for code generation."""
    key: str = ""
    value: str = ""
    enabled: bool = True


class CodegenAuth(BaseModel):
    """Auth config for code generation."""
    type: str = "none"
    token: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None


class CodegenBody(BaseModel):
    """Body config for code generation."""
    type: str = "none"
    content: Optional[str] = None
    form_data: Optional[List[CodegenKeyValue]] = None


class CodegenRequest(BaseModel):
    """Schema for requesting code snippet generation."""
    method: str = "GET"
    url: str
    headers: Optional[List[CodegenKeyValue]] = []
    params: Optional[List[CodegenKeyValue]] = []
    body: Optional[CodegenBody] = None
    auth: Optional[CodegenAuth] = None


class CodegenResponse(BaseModel):
    """Schema for code generation response."""
    language: str
    code: str
