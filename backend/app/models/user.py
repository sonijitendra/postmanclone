"""User model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    """User model - represents a workspace user."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    environments = relationship("Environment", back_populates="user", cascade="all, delete-orphan")
    history_entries = relationship("History", back_populates="user", cascade="all, delete-orphan")
    open_tabs = relationship("OpenTab", back_populates="user", cascade="all, delete-orphan")
