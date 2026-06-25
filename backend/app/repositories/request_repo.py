"""Repository for Request database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.request import Request


class RequestRepository:
    """Handles all database operations for saved requests."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, request_id: str) -> Optional[Request]:
        """Get a single request by ID."""
        return self.db.query(Request).filter(Request.id == request_id).first()

    def get_by_collection(self, collection_id: str) -> List[Request]:
        """Get all requests in a collection."""
        return (
            self.db.query(Request)
            .filter(Request.collection_id == collection_id)
            .order_by(Request.sort_order, Request.created_at)
            .all()
        )

    def create(self, collection_id: str, **kwargs) -> Request:
        """Create a new request in a collection."""
        # Get max sort_order in collection
        max_order = (
            self.db.query(Request.sort_order)
            .filter(Request.collection_id == collection_id)
            .order_by(Request.sort_order.desc())
            .first()
        )
        sort_order = (max_order[0] + 1) if max_order else 0

        # Convert Pydantic models to dicts for JSON columns
        headers = kwargs.get("headers", [])
        if headers and hasattr(headers[0], "model_dump"):
            headers = [h.model_dump() for h in headers]

        params = kwargs.get("params", [])
        if params and hasattr(params[0], "model_dump"):
            params = [p.model_dump() for p in params]

        body = kwargs.get("body")
        if body and hasattr(body, "model_dump"):
            body = body.model_dump()

        request = Request(
            collection_id=collection_id,
            name=kwargs.get("name", "Untitled Request"),
            method=kwargs.get("method", "GET"),
            url=kwargs.get("url", ""),
            headers=headers,
            params=params,
            body=body,
            body_type=kwargs.get("body_type", "none"),
            auth_type=kwargs.get("auth_type", "none"),
            auth_data=kwargs.get("auth_data"),
            sort_order=sort_order,
        )
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return request

    def update(self, request: Request, **kwargs) -> Request:
        """Update a request's fields."""
        for key, value in kwargs.items():
            if value is not None and hasattr(request, key):
                # Convert Pydantic models to dicts
                if isinstance(value, list) and value and hasattr(value[0], "model_dump"):
                    value = [v.model_dump() for v in value]
                elif hasattr(value, "model_dump"):
                    value = value.model_dump()
                setattr(request, key, value)
        self.db.commit()
        self.db.refresh(request)
        return request

    def delete(self, request: Request) -> None:
        """Delete a request."""
        self.db.delete(request)
        self.db.commit()
