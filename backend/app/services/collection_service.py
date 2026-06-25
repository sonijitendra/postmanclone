"""Collection service - business logic for collections."""

from typing import List
from sqlalchemy.orm import Session

from app.models.collection import Collection
from app.repositories.collection_repo import CollectionRepository
from app.schemas.collection import CollectionCreate, CollectionUpdate, CollectionResponse
from app.core.exceptions import NotFoundException


DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


class CollectionService:
    """Business logic layer for collection operations."""

    def __init__(self, db: Session):
        self.repo = CollectionRepository(db)

    def get_all(self) -> List[Collection]:
        """Get all collections for the default user."""
        return self.repo.get_all(DEFAULT_USER_ID)

    def get_by_id(self, collection_id: str) -> Collection:
        """Get a collection by ID or raise NotFoundException."""
        collection = self.repo.get_by_id(collection_id)
        if not collection:
            raise NotFoundException("Collection", collection_id)
        return collection

    def create(self, data: CollectionCreate) -> Collection:
        """Create a new collection."""
        return self.repo.create(
            user_id=DEFAULT_USER_ID,
            name=data.name,
            description=data.description,
        )

    def update(self, collection_id: str, data: CollectionUpdate) -> Collection:
        """Update an existing collection."""
        collection = self.get_by_id(collection_id)
        update_data = data.model_dump(exclude_unset=True)
        return self.repo.update(collection, **update_data)

    def delete(self, collection_id: str) -> None:
        """Delete a collection and all its requests."""
        collection = self.get_by_id(collection_id)
        self.repo.delete(collection)
