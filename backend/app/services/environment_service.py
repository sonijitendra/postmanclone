"""Environment service - business logic for environments."""

from typing import List
from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.repositories.environment_repo import EnvironmentRepository
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentUpdate,
    EnvironmentVariableBulkUpdate,
)
from app.core.exceptions import NotFoundException


DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


class EnvironmentService:
    """Business logic layer for environment operations."""

    def __init__(self, db: Session):
        self.repo = EnvironmentRepository(db)

    def get_all(self) -> List[Environment]:
        """Get all environments for the default user."""
        return self.repo.get_all(DEFAULT_USER_ID)

    def get_by_id(self, env_id: str) -> Environment:
        """Get an environment by ID or raise NotFoundException."""
        env = self.repo.get_by_id(env_id)
        if not env:
            raise NotFoundException("Environment", env_id)
        return env

    def create(self, data: EnvironmentCreate) -> Environment:
        """Create a new environment with optional initial variables."""
        variables = [v.model_dump() for v in (data.variables or [])]
        return self.repo.create(
            user_id=DEFAULT_USER_ID,
            name=data.name,
            variables=variables,
        )

    def update(self, env_id: str, data: EnvironmentUpdate) -> Environment:
        """Update an environment's metadata."""
        env = self.get_by_id(env_id)
        update_data = data.model_dump(exclude_unset=True)
        return self.repo.update(env, **update_data)

    def delete(self, env_id: str) -> None:
        """Delete an environment and its variables."""
        env = self.get_by_id(env_id)
        self.repo.delete(env)

    def activate(self, env_id: str) -> Environment:
        """Set an environment as the active one."""
        env = self.get_by_id(env_id)  # Verify it exists
        return self.repo.activate(DEFAULT_USER_ID, env_id)

    def deactivate_all(self) -> None:
        """Deactivate all environments (select 'No Environment')."""
        envs = self.repo.get_all(DEFAULT_USER_ID)
        for env in envs:
            if env.is_active:
                self.repo.update(env, is_active=False)

    def bulk_update_variables(
        self, env_id: str, data: EnvironmentVariableBulkUpdate
    ) -> Environment:
        """Replace all variables for an environment."""
        self.get_by_id(env_id)  # Verify it exists
        variables = [v.model_dump() for v in data.variables]
        return self.repo.bulk_update_variables(env_id, variables)
