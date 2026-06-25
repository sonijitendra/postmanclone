"""Initial schema - all tables

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Collections table
    op.create_table(
        "collections",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("sort_order", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_collections_user_id", "collections", ["user_id"])

    # Requests table
    op.create_table(
        "requests",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("collection_id", sa.String(36), sa.ForeignKey("collections.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("method", sa.String(10), nullable=False, server_default="GET"),
        sa.Column("url", sa.Text, nullable=False, server_default=""),
        sa.Column("headers", sa.JSON, nullable=True),
        sa.Column("params", sa.JSON, nullable=True),
        sa.Column("body", sa.JSON, nullable=True),
        sa.Column("body_type", sa.String(30), nullable=False, server_default="none"),
        sa.Column("auth_type", sa.String(30), nullable=False, server_default="none"),
        sa.Column("auth_data", sa.JSON, nullable=True),
        sa.Column("sort_order", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_requests_collection_id", "requests", ["collection_id"])

    # Environments table
    op.create_table(
        "environments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_environments_user_id", "environments", ["user_id"])

    # Environment Variables table
    op.create_table(
        "environment_variables",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("environment_id", sa.String(36), sa.ForeignKey("environments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key", sa.String(255), nullable=False),
        sa.Column("value", sa.Text, nullable=False, server_default=""),
        sa.Column("enabled", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_env_vars_environment_id", "environment_variables", ["environment_id"])

    # History table
    op.create_table(
        "history",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("method", sa.String(10), nullable=False),
        sa.Column("url", sa.Text, nullable=False),
        sa.Column("request_headers", sa.JSON, nullable=True),
        sa.Column("request_params", sa.JSON, nullable=True),
        sa.Column("request_body", sa.JSON, nullable=True),
        sa.Column("body_type", sa.String(30), nullable=False, server_default="none"),
        sa.Column("auth_type", sa.String(30), nullable=False, server_default="none"),
        sa.Column("auth_data", sa.JSON, nullable=True),
        sa.Column("response_status", sa.Integer, nullable=True),
        sa.Column("response_headers", sa.JSON, nullable=True),
        sa.Column("response_body", sa.Text, nullable=True),
        sa.Column("response_time_ms", sa.Float, nullable=True),
        sa.Column("response_size_bytes", sa.Integer, nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_history_user_id", "history", ["user_id"])
    op.create_index("ix_history_created_at", "history", ["created_at"])

    # Open Tabs table
    op.create_table(
        "open_tabs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("request_id", sa.String(36), sa.ForeignKey("requests.id", ondelete="SET NULL"), nullable=True),
        sa.Column("history_id", sa.String(36), sa.ForeignKey("history.id", ondelete="SET NULL"), nullable=True),
        sa.Column("tab_type", sa.String(20), nullable=False, server_default="new"),
        sa.Column("title", sa.String(255), nullable=False, server_default="Untitled Request"),
        sa.Column("unsaved_state", sa.JSON, nullable=True),
        sa.Column("is_active", sa.Boolean, default=False),
        sa.Column("sort_order", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_open_tabs_user_id", "open_tabs", ["user_id"])


def downgrade() -> None:
    op.drop_table("open_tabs")
    op.drop_table("history")
    op.drop_table("environment_variables")
    op.drop_table("environments")
    op.drop_table("requests")
    op.drop_table("collections")
    op.drop_table("users")
