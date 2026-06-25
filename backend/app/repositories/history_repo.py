"""Repository for History database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.history import History


class HistoryRepository:
    """Handles all database operations for request history."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: str, limit: int = 50, offset: int = 0) -> List[History]:
        """Get history entries for a user, most recent first."""
        return (
            self.db.query(History)
            .filter(History.user_id == user_id)
            .order_by(History.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_by_id(self, history_id: str) -> Optional[History]:
        """Get a single history entry by ID."""
        return self.db.query(History).filter(History.id == history_id).first()

    def create(self, user_id: str, **kwargs) -> History:
        """Create a new history entry."""
        entry = History(user_id=user_id, **kwargs)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete(self, entry: History) -> None:
        """Delete a single history entry."""
        self.db.delete(entry)
        self.db.commit()

    def clear_all(self, user_id: str) -> int:
        """Delete all history for a user. Returns count of deleted entries."""
        count = (
            self.db.query(History)
            .filter(History.user_id == user_id)
            .delete()
        )
        self.db.commit()
        return count
