"""History model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class History(Base):
    """History model - an immutable record of a sent request and its response."""

    __tablename__ = "history"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    method: Mapped[str] = mapped_column(String(10), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    request_headers: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    request_params: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    request_body: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    body_type: Mapped[str] = mapped_column(String(30), nullable=False, default="none")
    auth_type: Mapped[str] = mapped_column(String(30), nullable=False, default="none")
    auth_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    response_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_headers: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    response_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_time_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    response_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="history_entries")
