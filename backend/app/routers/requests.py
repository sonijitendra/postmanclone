"""Requests router - CRUD for saved requests within collections."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.request_service import RequestService
from app.schemas.request import RequestCreate, RequestUpdate, RequestResponse

router = APIRouter(tags=["Requests"])


@router.post(
    "/collections/{collection_id}/requests",
    response_model=RequestResponse,
    status_code=201,
)
def create_request(
    collection_id: str, data: RequestCreate, db: Session = Depends(get_db)
):
    """Save a new request to a collection."""
    service = RequestService(db)
    return service.create(collection_id, data)


@router.get("/requests/{request_id}", response_model=RequestResponse)
def get_request(request_id: str, db: Session = Depends(get_db)):
    """Get a single saved request by ID."""
    service = RequestService(db)
    return service.get_by_id(request_id)


@router.patch("/requests/{request_id}", response_model=RequestResponse)
def update_request(
    request_id: str, data: RequestUpdate, db: Session = Depends(get_db)
):
    """Update a saved request."""
    service = RequestService(db)
    return service.update(request_id, data)


@router.delete("/requests/{request_id}", status_code=204)
def delete_request(request_id: str, db: Session = Depends(get_db)):
    """Delete a saved request."""
    service = RequestService(db)
    service.delete(request_id)
