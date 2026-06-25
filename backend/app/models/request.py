"""Request model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Request(Base):
    """Request model - a saved HTTP request within a collection."""

    __tablename__ = "requests"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    collection_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("collections.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    method: Mapped[str] = mapped_column(String(10), nullable=False, default="GET")
    url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    headers: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=list)
    params: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=list)
    body: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    body_type: Mapped[str] = mapped_column(String(30), nullable=False, default="none")
    auth_type: Mapped[str] = mapped_column(String(30), nullable=False, default="none")
    auth_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
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
    collection = relationship("Collection", back_populates="requests")
