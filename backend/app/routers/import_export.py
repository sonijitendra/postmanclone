"""Import/Export router for Postman Collection v2 format."""

from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.import_export_service import ImportExportService

router = APIRouter(tags=["Import/Export"])


@router.post("/import/postman-v2")
def import_postman_v2(
    data: Dict[str, Any], db: Session = Depends(get_db)
):
    """Import a Postman Collection v2 JSON file."""
    service = ImportExportService(db)
    return service.import_postman_v2(data)


@router.get("/export/postman-v2/{collection_id}")
def export_postman_v2(collection_id: str, db: Session = Depends(get_db)):
    """Export a collection as Postman Collection v2 JSON."""
    service = ImportExportService(db)
    return service.export_postman_v2(collection_id)
