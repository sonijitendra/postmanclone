"""Request service - business logic for saved requests."""

from sqlalchemy.orm import Session

from app.models.request import Request
from app.repositories.request_repo import RequestRepository
from app.repositories.collection_repo import CollectionRepository
from app.schemas.request import RequestCreate, RequestUpdate
from app.core.exceptions import NotFoundException


class RequestService:
    """Business logic layer for request operations."""

    def __init__(self, db: Session):
        self.repo = RequestRepository(db)
        self.collection_repo = CollectionRepository(db)

    def get_by_id(self, request_id: str) -> Request:
        """Get a request by ID or raise NotFoundException."""
        request = self.repo.get_by_id(request_id)
        if not request:
            raise NotFoundException("Request", request_id)
        return request

    def create(self, collection_id: str, data: RequestCreate) -> Request:
        """Save a new request to a collection."""
        # Verify collection exists
        collection = self.collection_repo.get_by_id(collection_id)
        if not collection:
            raise NotFoundException("Collection", collection_id)

        return self.repo.create(
            collection_id=collection_id,
            **data.model_dump(),
        )

    def update(self, request_id: str, data: RequestUpdate) -> Request:
        """Update an existing request."""
        request = self.get_by_id(request_id)
        update_data = data.model_dump(exclude_unset=True)
        return self.repo.update(request, **update_data)

    def delete(self, request_id: str) -> None:
        """Delete a request."""
        request = self.get_by_id(request_id)
        self.repo.delete(request)
