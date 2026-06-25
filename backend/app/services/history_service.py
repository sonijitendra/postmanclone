"""History service - business logic for request history."""

from typing import List
from sqlalchemy.orm import Session

from app.models.history import History
from app.repositories.history_repo import HistoryRepository
from app.core.exceptions import NotFoundException


DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


class HistoryService:
    """Business logic layer for history operations."""

    def __init__(self, db: Session):
        self.repo = HistoryRepository(db)

    def get_all(self, limit: int = 50, offset: int = 0) -> List[History]:
        """Get history entries for the default user."""
        return self.repo.get_all(DEFAULT_USER_ID, limit=limit, offset=offset)

    def get_by_id(self, history_id: str) -> History:
        """Get a history entry by ID or raise NotFoundException."""
        entry = self.repo.get_by_id(history_id)
        if not entry:
            raise NotFoundException("History entry", history_id)
        return entry

    def delete(self, history_id: str) -> None:
        """Delete a single history entry."""
        entry = self.get_by_id(history_id)
        self.repo.delete(entry)

    def clear_all(self) -> int:
        """Clear all history for the default user."""
        return self.repo.clear_all(DEFAULT_USER_ID)
