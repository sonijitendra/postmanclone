"""Collections router - thin layer delegating to CollectionService."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.collection_service import CollectionService
from app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
)

router = APIRouter(prefix="/collections", tags=["Collections"])


@router.get("", response_model=List[CollectionResponse])
def list_collections(db: Session = Depends(get_db)):
    """List all collections with their nested requests."""
    service = CollectionService(db)
    return service.get_all()


@router.post("", response_model=CollectionResponse, status_code=201)
def create_collection(data: CollectionCreate, db: Session = Depends(get_db)):
    """Create a new collection."""
    service = CollectionService(db)
    return service.create(data)


@router.get("/{collection_id}", response_model=CollectionResponse)
def get_collection(collection_id: str, db: Session = Depends(get_db)):
    """Get a single collection by ID."""
    service = CollectionService(db)
    return service.get_by_id(collection_id)


@router.patch("/{collection_id}", response_model=CollectionResponse)
def update_collection(
    collection_id: str, data: CollectionUpdate, db: Session = Depends(get_db)
):
    """Update a collection (e.g., rename)."""
    service = CollectionService(db)
    return service.update(collection_id, data)


@router.delete("/{collection_id}", status_code=204)
def delete_collection(collection_id: str, db: Session = Depends(get_db)):
    """Delete a collection and all its requests."""
    service = CollectionService(db)
    service.delete(collection_id)
