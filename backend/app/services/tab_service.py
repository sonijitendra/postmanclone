"""Tab service - business logic for open tabs."""

from typing import List
from sqlalchemy.orm import Session

from app.models.open_tab import OpenTab
from app.repositories.tab_repo import TabRepository
from app.schemas.tab import TabCreate, TabUpdate, TabReorderRequest
from app.core.exceptions import NotFoundException


DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


class TabService:
    """Business logic layer for tab operations."""

    def __init__(self, db: Session):
        self.repo = TabRepository(db)

    def get_all(self) -> List[OpenTab]:
        """Get all open tabs for the default user."""
        return self.repo.get_all(DEFAULT_USER_ID)

    def create(self, data: TabCreate) -> OpenTab:
        """Open a new tab."""
        return self.repo.create(
            user_id=DEFAULT_USER_ID,
            **data.model_dump(),
        )

    def update(self, tab_id: str, data: TabUpdate) -> OpenTab:
        """Update a tab's state."""
        tab = self.repo.get_by_id(tab_id)
        if not tab:
            raise NotFoundException("Tab", tab_id)
        update_data = data.model_dump(exclude_unset=True)
        return self.repo.update(tab, **update_data)

    def delete(self, tab_id: str) -> None:
        """Close a tab."""
        tab = self.repo.get_by_id(tab_id)
        if not tab:
            raise NotFoundException("Tab", tab_id)
        self.repo.delete(tab)

    def reorder(self, data: TabReorderRequest) -> List[OpenTab]:
        """Reorder tabs."""
        return self.repo.reorder(DEFAULT_USER_ID, data.tab_ids)
