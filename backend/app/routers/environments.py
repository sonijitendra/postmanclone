"""Environments router - CRUD for environments and variables."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.environment_service import EnvironmentService
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentUpdate,
    EnvironmentResponse,
    EnvironmentVariableBulkUpdate,
)

router = APIRouter(prefix="/environments", tags=["Environments"])


@router.get("", response_model=List[EnvironmentResponse])
def list_environments(db: Session = Depends(get_db)):
    """List all environments with their variables."""
    service = EnvironmentService(db)
    return service.get_all()


@router.post("", response_model=EnvironmentResponse, status_code=201)
def create_environment(data: EnvironmentCreate, db: Session = Depends(get_db)):
    """Create a new environment with optional initial variables."""
    service = EnvironmentService(db)
    return service.create(data)


@router.get("/{env_id}", response_model=EnvironmentResponse)
def get_environment(env_id: str, db: Session = Depends(get_db)):
    """Get a single environment by ID with its variables."""
    service = EnvironmentService(db)
    return service.get_by_id(env_id)


@router.patch("/{env_id}", response_model=EnvironmentResponse)
def update_environment(
    env_id: str, data: EnvironmentUpdate, db: Session = Depends(get_db)
):
    """Update an environment's metadata."""
    service = EnvironmentService(db)
    return service.update(env_id, data)


@router.delete("/{env_id}", status_code=204)
def delete_environment(env_id: str, db: Session = Depends(get_db)):
    """Delete an environment and its variables."""
    service = EnvironmentService(db)
    service.delete(env_id)


@router.post("/{env_id}/activate", response_model=EnvironmentResponse)
def activate_environment(env_id: str, db: Session = Depends(get_db)):
    """Set an environment as the active one."""
    service = EnvironmentService(db)
    return service.activate(env_id)


@router.post("/deactivate", status_code=200)
def deactivate_all_environments(db: Session = Depends(get_db)):
    """Deactivate all environments (select 'No Environment')."""
    service = EnvironmentService(db)
    service.deactivate_all()
    return {"status": "ok"}


@router.put("/{env_id}/variables", response_model=EnvironmentResponse)
def bulk_update_variables(
    env_id: str, data: EnvironmentVariableBulkUpdate, db: Session = Depends(get_db)
):
    """Replace all variables for an environment."""
    service = EnvironmentService(db)
    return service.bulk_update_variables(env_id, data)
