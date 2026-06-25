"""Repository for Environment database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.environment import Environment
from app.models.environment_variable import EnvironmentVariable


class EnvironmentRepository:
    """Handles all database operations for environments and their variables."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: str) -> List[Environment]:
        """Get all environments for a user with variables."""
        return (
            self.db.query(Environment)
            .options(joinedload(Environment.variables))
            .filter(Environment.user_id == user_id)
            .order_by(Environment.created_at)
            .all()
        )

    def get_by_id(self, env_id: str) -> Optional[Environment]:
        """Get a single environment by ID with variables."""
        return (
            self.db.query(Environment)
            .options(joinedload(Environment.variables))
            .filter(Environment.id == env_id)
            .first()
        )

    def get_active(self, user_id: str) -> Optional[Environment]:
        """Get the currently active environment for a user."""
        return (
            self.db.query(Environment)
            .options(joinedload(Environment.variables))
            .filter(Environment.user_id == user_id, Environment.is_active == True)
            .first()
        )

    def create(self, user_id: str, name: str, variables: List[dict] = None) -> Environment:
        """Create a new environment with optional initial variables."""
        env = Environment(user_id=user_id, name=name)
        self.db.add(env)
        self.db.flush()  # Get the ID before adding variables

        if variables:
            for var_data in variables:
                var = EnvironmentVariable(
                    environment_id=env.id,
                    key=var_data.get("key", ""),
                    value=var_data.get("value", ""),
                    enabled=var_data.get("enabled", True),
                )
                self.db.add(var)

        self.db.commit()
        self.db.refresh(env)
        return env

    def update(self, env: Environment, **kwargs) -> Environment:
        """Update an environment's fields."""
        for key, value in kwargs.items():
            if value is not None and hasattr(env, key):
                setattr(env, key, value)
        self.db.commit()
        self.db.refresh(env)
        return env

    def delete(self, env: Environment) -> None:
        """Delete an environment and all its variables (cascade)."""
        self.db.delete(env)
        self.db.commit()

    def activate(self, user_id: str, env_id: str) -> Environment:
        """Set an environment as active, deactivating all others for the user."""
        # Deactivate all environments for this user
        self.db.query(Environment).filter(
            Environment.user_id == user_id
        ).update({"is_active": False})

        # Activate the target environment
        env = self.get_by_id(env_id)
        if env:
            env.is_active = True
            self.db.commit()
            self.db.refresh(env)
        return env

    def bulk_update_variables(
        self, env_id: str, variables: List[dict]
    ) -> Environment:
        """Replace all variables for an environment."""
        # Delete existing variables
        self.db.query(EnvironmentVariable).filter(
            EnvironmentVariable.environment_id == env_id
        ).delete()

        # Add new variables
        for var_data in variables:
            var = EnvironmentVariable(
                environment_id=env_id,
                key=var_data.get("key", ""),
                value=var_data.get("value", ""),
                enabled=var_data.get("enabled", True),
            )
            self.db.add(var)

        self.db.commit()
        return self.get_by_id(env_id)
