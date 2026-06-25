"""Repository for OpenTab database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.open_tab import OpenTab


class TabRepository:
    """Handles all database operations for open tabs."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: str) -> List[OpenTab]:
        """Get all open tabs for a user."""
        return (
            self.db.query(OpenTab)
            .filter(OpenTab.user_id == user_id)
            .order_by(OpenTab.sort_order)
            .all()
        )

    def get_by_id(self, tab_id: str) -> Optional[OpenTab]:
        """Get a single tab by ID."""
        return self.db.query(OpenTab).filter(OpenTab.id == tab_id).first()

    def create(self, user_id: str, **kwargs) -> OpenTab:
        """Create a new tab."""
        # If this tab is active, deactivate others
        if kwargs.get("is_active", True):
            self.db.query(OpenTab).filter(
                OpenTab.user_id == user_id
            ).update({"is_active": False})

        # Get max sort_order
        max_order = (
            self.db.query(OpenTab.sort_order)
            .filter(OpenTab.user_id == user_id)
            .order_by(OpenTab.sort_order.desc())
            .first()
        )
        sort_order = (max_order[0] + 1) if max_order else 0

        tab = OpenTab(
            user_id=user_id,
            sort_order=sort_order,
            **kwargs,
        )
        self.db.add(tab)
        self.db.commit()
        self.db.refresh(tab)
        return tab

    def update(self, tab: OpenTab, **kwargs) -> OpenTab:
        """Update a tab's fields."""
        # If setting this tab active, deactivate others
        if kwargs.get("is_active") is True:
            self.db.query(OpenTab).filter(
                OpenTab.user_id == tab.user_id,
                OpenTab.id != tab.id,
            ).update({"is_active": False})

        for key, value in kwargs.items():
            if value is not None and hasattr(tab, key):
                setattr(tab, key, value)
        self.db.commit()
        self.db.refresh(tab)
        return tab

    def delete(self, tab: OpenTab) -> None:
        """Delete a tab."""
        self.db.delete(tab)
        self.db.commit()

    def reorder(self, user_id: str, tab_ids: List[str]) -> List[OpenTab]:
        """Reorder tabs based on the provided ID list."""
        for idx, tab_id in enumerate(tab_ids):
            self.db.query(OpenTab).filter(
                OpenTab.id == tab_id,
                OpenTab.user_id == user_id,
            ).update({"sort_order": idx})
        self.db.commit()
        return self.get_all(user_id)
