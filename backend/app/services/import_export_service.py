"""Import/Export service for Postman Collection v2 format."""

import uuid
from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.repositories.collection_repo import CollectionRepository
from app.repositories.request_repo import RequestRepository
from app.core.exceptions import NotFoundException, ValidationError


DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


class ImportExportService:
    """Handles import and export of Postman Collection v2.1 format."""

    def __init__(self, db: Session):
        self.db = db
        self.collection_repo = CollectionRepository(db)
        self.request_repo = RequestRepository(db)

    def import_postman_v2(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Import a Postman Collection v2.1 JSON.

        Expected format:
        {
            "info": { "name": "...", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/..." },
            "item": [
                {
                    "name": "Request Name",
                    "request": {
                        "method": "GET",
                        "header": [...],
                        "url": { "raw": "...", "query": [...] },
                        "body": { ... },
                        "auth": { ... }
                    }
                }
            ]
        }
        """
        if not data or "info" not in data:
            raise ValidationError("Invalid Postman Collection v2 format: missing 'info' field")

        info = data["info"]
        collection_name = info.get("name", "Imported Collection")

        # Create collection
        collection = self.collection_repo.create(
            user_id=DEFAULT_USER_ID,
            name=collection_name,
            description=info.get("description"),
        )

        # Import items (requests)
        items = data.get("item", [])
        imported_count = self._import_items(collection.id, items)

        return {
            "collection_id": collection.id,
            "collection_name": collection_name,
            "imported_requests": imported_count,
        }

    def _import_items(self, collection_id: str, items: List[Dict]) -> int:
        """Recursively import items (handles nested folders)."""
        count = 0
        for item in items:
            if "item" in item:
                # It's a folder - flatten into the collection
                count += self._import_items(collection_id, item["item"])
            elif "request" in item:
                self._import_request(collection_id, item)
                count += 1
        return count

    def _import_request(self, collection_id: str, item: Dict) -> None:
        """Import a single request item."""
        req = item.get("request", {})

        # Parse URL
        url_data = req.get("url", {})
        if isinstance(url_data, str):
            url = url_data
            params = []
        else:
            url = url_data.get("raw", "")
            params = [
                {"key": q.get("key", ""), "value": q.get("value", ""), "enabled": not q.get("disabled", False)}
                for q in url_data.get("query", [])
            ]

        # Parse headers
        headers = [
            {"key": h.get("key", ""), "value": h.get("value", ""), "enabled": not h.get("disabled", False)}
            for h in req.get("header", [])
        ]

        # Parse body
        body = None
        body_type = "none"
        raw_body = req.get("body", {})
        if raw_body:
            mode = raw_body.get("mode", "none")
            if mode == "raw":
                options = raw_body.get("options", {})
                language = options.get("raw", {}).get("language", "json")
                body_type = "raw_json" if language == "json" else "raw_text"
                body = {"type": body_type, "content": raw_body.get("raw", "")}
            elif mode == "formdata":
                body_type = "form_data"
                form_data = [
                    {"key": f.get("key", ""), "value": f.get("value", ""), "enabled": not f.get("disabled", False)}
                    for f in raw_body.get("formdata", [])
                ]
                body = {"type": "form_data", "form_data": form_data}
            elif mode == "urlencoded":
                body_type = "x_www_form_urlencoded"
                form_data = [
                    {"key": f.get("key", ""), "value": f.get("value", ""), "enabled": not f.get("disabled", False)}
                    for f in raw_body.get("urlencoded", [])
                ]
                body = {"type": "x_www_form_urlencoded", "form_data": form_data}

        # Parse auth
        auth_type = "none"
        auth_data = None
        raw_auth = req.get("auth", {})
        if raw_auth:
            auth_type_str = raw_auth.get("type", "none")
            if auth_type_str == "bearer":
                auth_type = "bearer"
                bearer_items = raw_auth.get("bearer", [])
                token = next((b.get("value", "") for b in bearer_items if b.get("key") == "token"), "")
                auth_data = {"type": "bearer", "token": token}
            elif auth_type_str == "basic":
                auth_type = "basic"
                basic_items = raw_auth.get("basic", [])
                username = next((b.get("value", "") for b in basic_items if b.get("key") == "username"), "")
                password = next((b.get("value", "") for b in basic_items if b.get("key") == "password"), "")
                auth_data = {"type": "basic", "username": username, "password": password}

        self.request_repo.create(
            collection_id=collection_id,
            name=item.get("name", "Imported Request"),
            method=req.get("method", "GET"),
            url=url,
            headers=headers,
            params=params,
            body=body,
            body_type=body_type,
            auth_type=auth_type,
            auth_data=auth_data,
        )

    def export_postman_v2(self, collection_id: str) -> Dict[str, Any]:
        """Export a collection as Postman Collection v2.1 JSON."""
        collection = self.collection_repo.get_by_id(collection_id)
        if not collection:
            raise NotFoundException("Collection", collection_id)

        items = []
        for req in collection.requests:
            item = self._export_request(req)
            items.append(item)

        return {
            "info": {
                "_postman_id": str(uuid.uuid4()),
                "name": collection.name,
                "description": collection.description or "",
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            },
            "item": items,
        }

    def _export_request(self, req) -> Dict[str, Any]:
        """Export a single request as a Postman item."""
        # Build URL object
        url_obj: Dict[str, Any] = {"raw": req.url}
        if req.params:
            url_obj["query"] = [
                {"key": p.get("key", ""), "value": p.get("value", ""), "disabled": not p.get("enabled", True)}
                for p in (req.params or [])
            ]

        # Build headers
        headers = [
            {"key": h.get("key", ""), "value": h.get("value", ""), "disabled": not h.get("enabled", True)}
            for h in (req.headers or [])
        ]

        # Build body
        body_obj = {}
        if req.body and req.body_type != "none":
            body_data = req.body if isinstance(req.body, dict) else {}
            if req.body_type in ("raw_json", "raw_text"):
                body_obj = {
                    "mode": "raw",
                    "raw": body_data.get("content", ""),
                    "options": {
                        "raw": {
                            "language": "json" if req.body_type == "raw_json" else "text"
                        }
                    },
                }
            elif req.body_type == "form_data":
                body_obj = {
                    "mode": "formdata",
                    "formdata": [
                        {"key": f.get("key", ""), "value": f.get("value", ""), "type": "text"}
                        for f in body_data.get("form_data", [])
                    ],
                }
            elif req.body_type == "x_www_form_urlencoded":
                body_obj = {
                    "mode": "urlencoded",
                    "urlencoded": [
                        {"key": f.get("key", ""), "value": f.get("value", ""), "type": "text"}
                        for f in body_data.get("form_data", [])
                    ],
                }

        # Build auth
        auth_obj = {}
        if req.auth_type and req.auth_type != "none" and req.auth_data:
            if req.auth_type == "bearer":
                auth_obj = {
                    "type": "bearer",
                    "bearer": [{"key": "token", "value": req.auth_data.get("token", ""), "type": "string"}],
                }
            elif req.auth_type == "basic":
                auth_obj = {
                    "type": "basic",
                    "basic": [
                        {"key": "username", "value": req.auth_data.get("username", ""), "type": "string"},
                        {"key": "password", "value": req.auth_data.get("password", ""), "type": "string"},
                    ],
                }

        request_obj: Dict[str, Any] = {
            "method": req.method,
            "header": headers,
            "url": url_obj,
        }
        if body_obj:
            request_obj["body"] = body_obj
        if auth_obj:
            request_obj["auth"] = auth_obj

        return {
            "name": req.name,
            "request": request_obj,
            "response": [],
        }
