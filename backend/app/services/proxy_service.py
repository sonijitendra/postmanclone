"""Proxy service - executes HTTP requests on behalf of the client."""

import time
import base64
from typing import Optional
from urllib.parse import urlencode, urlparse, parse_qs, urlunparse

import httpx
from sqlalchemy.orm import Session

from app.schemas.proxy import ProxySendRequest, ProxySendResponse
from app.repositories.environment_repo import EnvironmentRepository
from app.repositories.history_repo import HistoryRepository
from app.utils.variable_resolver import (
    resolve_variables,
    resolve_key_value_list,
    build_variable_dict,
)
from app.core.config import settings


# Default user ID (assumes a single default user per assignment spec)
DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


class ProxyService:
    """Handles proxying HTTP requests to external APIs."""

    def __init__(self, db: Session):
        self.db = db
        self.env_repo = EnvironmentRepository(db)
        self.history_repo = HistoryRepository(db)

    async def send_request(self, request: ProxySendRequest) -> ProxySendResponse:
        """Execute an HTTP request through the backend proxy.

        Steps:
        1. Resolve environment variables in URL, headers, body, auth
        2. Build the final HTTP request
        3. Execute with httpx
        4. Record in history
        5. Return structured response
        """
        # 1. Resolve environment variables
        variables = {}
        if request.environment_id:
            env = self.env_repo.get_by_id(request.environment_id)
            variables = build_variable_dict(env)
        else:
            # Check for active environment
            env = self.env_repo.get_active(DEFAULT_USER_ID)
            if env:
                variables = build_variable_dict(env)

        # Resolve URL
        resolved_url = resolve_variables(request.url, variables)

        # Resolve query params and append to URL
        resolved_params = resolve_key_value_list(
            [p.model_dump() for p in (request.params or [])], variables
        )
        enabled_params = {
            p["key"]: p["value"]
            for p in resolved_params
            if p.get("enabled", True) and p.get("key")
        }

        if enabled_params:
            # Parse existing URL and merge params
            parsed = urlparse(resolved_url)
            existing_params = parse_qs(parsed.query, keep_blank_values=True)
            # Flatten existing params
            flat_existing = {k: v[0] if len(v) == 1 else v for k, v in existing_params.items()}
            flat_existing.update(enabled_params)
            new_query = urlencode(flat_existing, doseq=True)
            resolved_url = urlunparse(parsed._replace(query=new_query))

        # Resolve headers
        resolved_headers_list = resolve_key_value_list(
            [h.model_dump() for h in (request.headers or [])], variables
        )
        headers = {
            h["key"]: h["value"]
            for h in resolved_headers_list
            if h.get("enabled", True) and h.get("key")
        }

        # Resolve auth
        auth = None
        if request.auth and request.auth.type != "none":
            if request.auth.type == "bearer":
                token = resolve_variables(request.auth.token or "", variables)
                headers["Authorization"] = f"Bearer {token}"
            elif request.auth.type == "basic":
                username = resolve_variables(request.auth.username or "", variables)
                password = resolve_variables(request.auth.password or "", variables)
                credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
                headers["Authorization"] = f"Basic {credentials}"

        # Resolve body
        content = None
        data = None
        if request.body and request.body.type != "none":
            if request.body.type in ("raw_json", "raw_text"):
                content = resolve_variables(request.body.content or "", variables)
                if request.body.type == "raw_json" and "Content-Type" not in headers:
                    headers["Content-Type"] = "application/json"
                elif request.body.type == "raw_text" and "Content-Type" not in headers:
                    headers["Content-Type"] = "text/plain"
            elif request.body.type == "form_data":
                form_items = resolve_key_value_list(
                    [f.model_dump() for f in (request.body.form_data or [])], variables
                )
                data = {
                    f["key"]: f["value"]
                    for f in form_items
                    if f.get("enabled", True) and f.get("key")
                }
            elif request.body.type == "x_www_form_urlencoded":
                form_items = resolve_key_value_list(
                    [f.model_dump() for f in (request.body.form_data or [])], variables
                )
                data = {
                    f["key"]: f["value"]
                    for f in form_items
                    if f.get("enabled", True) and f.get("key")
                }
                if "Content-Type" not in headers:
                    headers["Content-Type"] = "application/x-www-form-urlencoded"

        # 2. Execute the request
        timeout = request.timeout or settings.DEFAULT_TIMEOUT
        response_data = ProxySendResponse()

        start_time = time.time()
        try:
            async with httpx.AsyncClient(
                timeout=timeout, follow_redirects=True, verify=False
            ) as client:
                resp = await client.request(
                    method=request.method.upper(),
                    url=resolved_url,
                    headers=headers,
                    content=content,
                    data=data,
                )

            elapsed = (time.time() - start_time) * 1000  # ms

            response_data.status_code = resp.status_code
            response_data.headers = dict(resp.headers)
            response_data.body = resp.text
            response_data.time_ms = round(elapsed, 2)
            response_data.size_bytes = len(resp.content)

        except httpx.TimeoutException:
            elapsed = (time.time() - start_time) * 1000
            response_data.time_ms = round(elapsed, 2)
            response_data.error = "Request timed out"

        except httpx.ConnectError as e:
            elapsed = (time.time() - start_time) * 1000
            response_data.time_ms = round(elapsed, 2)
            response_data.error = f"Connection error: Could not connect to {resolved_url}"

        except httpx.InvalidURL:
            elapsed = (time.time() - start_time) * 1000
            response_data.time_ms = round(elapsed, 2)
            response_data.error = f"Invalid URL: {resolved_url}"

        except Exception as e:
            elapsed = (time.time() - start_time) * 1000
            response_data.time_ms = round(elapsed, 2)
            response_data.error = f"Request failed: {str(e)}"

        # 3. Record in history
        try:
            self.history_repo.create(
                user_id=DEFAULT_USER_ID,
                method=request.method,
                url=request.url,  # Store original URL (with variables)
                request_headers=[h.model_dump() for h in (request.headers or [])],
                request_params=[p.model_dump() for p in (request.params or [])],
                request_body=request.body.model_dump() if request.body else None,
                body_type=request.body.type if request.body else "none",
                auth_type=request.auth.type if request.auth else "none",
                auth_data=request.auth.model_dump() if request.auth else None,
                response_status=response_data.status_code,
                response_headers=response_data.headers,
                response_body=response_data.body,
                response_time_ms=response_data.time_ms,
                response_size_bytes=response_data.size_bytes,
                error_message=response_data.error,
            )
        except Exception:
            # Don't fail the request if history recording fails
            pass

        return response_data
