"""Repository for Collection database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.collection import Collection


class CollectionRepository:
    """Handles all database operations for collections."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: str) -> List[Collection]:
        """Get all collections for a user, with nested requests."""
        return (
            self.db.query(Collection)
            .options(joinedload(Collection.requests))
            .filter(Collection.user_id == user_id)
            .order_by(Collection.sort_order, Collection.created_at)
            .all()
        )

    def get_by_id(self, collection_id: str) -> Optional[Collection]:
        """Get a single collection by ID with nested requests."""
        return (
            self.db.query(Collection)
            .options(joinedload(Collection.requests))
            .filter(Collection.id == collection_id)
            .first()
        )

    def create(self, user_id: str, name: str, description: Optional[str] = None) -> Collection:
        """Create a new collection."""
        # Get max sort_order
        max_order = (
            self.db.query(Collection.sort_order)
            .filter(Collection.user_id == user_id)
            .order_by(Collection.sort_order.desc())
            .first()
        )
        sort_order = (max_order[0] + 1) if max_order else 0

        collection = Collection(
            user_id=user_id,
            name=name,
            description=description,
            sort_order=sort_order,
        )
        self.db.add(collection)
        self.db.commit()
        self.db.refresh(collection)
        return collection

    def update(self, collection: Collection, **kwargs) -> Collection:
        """Update a collection's fields."""
        for key, value in kwargs.items():
            if value is not None and hasattr(collection, key):
                setattr(collection, key, value)
        self.db.commit()
        self.db.refresh(collection)
        return collection

    def delete(self, collection: Collection) -> None:
        """Delete a collection and all its requests (cascade)."""
        self.db.delete(collection)
        self.db.commit()
