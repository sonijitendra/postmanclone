"""Code generation router for cURL and Fetch snippets."""

from fastapi import APIRouter

from app.services.codegen_service import CodegenService
from app.schemas.codegen import CodegenRequest, CodegenResponse

router = APIRouter(prefix="/codegen", tags=["Code Generation"])


@router.post("/curl", response_model=CodegenResponse)
def generate_curl(data: CodegenRequest):
    """Generate a cURL command from a request configuration."""
    return CodegenService.generate_curl(data)


@router.post("/fetch", response_model=CodegenResponse)
def generate_fetch(data: CodegenRequest):
    """Generate a JavaScript fetch() call from a request configuration."""
    return CodegenService.generate_fetch(data)
