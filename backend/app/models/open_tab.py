"""Open Tab model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class OpenTab(Base):
    """OpenTab model - persists the state of open request tabs."""

    __tablename__ = "open_tabs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    request_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("requests.id", ondelete="SET NULL"), nullable=True
    )
    history_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("history.id", ondelete="SET NULL"), nullable=True
    )
    tab_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="new"
    )  # "new", "saved", "history"
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Untitled Request")
    unsaved_state: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="open_tabs")
