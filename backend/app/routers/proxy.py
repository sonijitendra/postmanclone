"""Proxy router - sends HTTP requests through the backend."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.proxy_service import ProxyService
from app.schemas.proxy import ProxySendRequest, ProxySendResponse

router = APIRouter(prefix="/proxy", tags=["Proxy"])


@router.post("/send", response_model=ProxySendResponse)
async def send_request(data: ProxySendRequest, db: Session = Depends(get_db)):
    """Execute an HTTP request through the backend proxy.

    This endpoint:
    1. Resolves environment variables ({{var}} syntax)
    2. Executes the HTTP request via httpx
    3. Records the request in history
    4. Returns the response with metadata
    """
    service = ProxyService(db)
    return await service.send_request(data)
