"""Code generation service for cURL and Fetch snippets."""

from typing import List, Optional
from app.schemas.codegen import CodegenRequest, CodegenResponse


class CodegenService:
    """Generates code snippets from request configuration."""

    @staticmethod
    def generate_curl(request: CodegenRequest) -> CodegenResponse:
        """Generate a cURL command from a request configuration."""
        parts = ["curl"]

        # Method (skip for GET as it's default)
        if request.method.upper() != "GET":
            parts.append(f"-X {request.method.upper()}")

        # URL with query params
        url = request.url
        enabled_params = [
            p for p in (request.params or []) if p.enabled and p.key
        ]
        if enabled_params:
            query = "&".join(f"{p.key}={p.value}" for p in enabled_params)
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}{query}"
        parts.append(f"'{url}'")

        # Headers
        for h in (request.headers or []):
            if h.enabled and h.key:
                parts.append(f"-H '{h.key}: {h.value}'")

        # Auth
        if request.auth and request.auth.type != "none":
            if request.auth.type == "bearer":
                parts.append(f"-H 'Authorization: Bearer {request.auth.token or ''}'")
            elif request.auth.type == "basic":
                parts.append(f"-u '{request.auth.username or ''}:{request.auth.password or ''}'")

        # Body
        if request.body and request.body.type != "none":
            if request.body.type in ("raw_json", "raw_text"):
                content = (request.body.content or "").replace("'", "'\\''")
                if request.body.type == "raw_json":
                    parts.append("-H 'Content-Type: application/json'")
                parts.append(f"-d '{content}'")
            elif request.body.type in ("form_data", "x_www_form_urlencoded"):
                for f in (request.body.form_data or []):
                    if f.enabled and f.key:
                        if request.body.type == "form_data":
                            parts.append(f"-F '{f.key}={f.value}'")
                        else:
                            parts.append(f"-d '{f.key}={f.value}'")

        code = " \\\n  ".join(parts)
        return CodegenResponse(language="curl", code=code)

    @staticmethod
    def generate_fetch(request: CodegenRequest) -> CodegenResponse:
        """Generate a JavaScript fetch() call from a request configuration."""
        # Build URL with params
        url = request.url
        enabled_params = [
            p for p in (request.params or []) if p.enabled and p.key
        ]
        if enabled_params:
            query = "&".join(f"{p.key}={p.value}" for p in enabled_params)
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}{query}"

        lines = [f"const response = await fetch('{url}', {{"]
        lines.append(f"  method: '{request.method.upper()}',")

        # Headers
        headers = {}
        for h in (request.headers or []):
            if h.enabled and h.key:
                headers[h.key] = h.value

        # Auth headers
        if request.auth and request.auth.type != "none":
            if request.auth.type == "bearer":
                headers["Authorization"] = f"Bearer {request.auth.token or ''}"
            elif request.auth.type == "basic":
                import base64
                creds = base64.b64encode(
                    f"{request.auth.username or ''}:{request.auth.password or ''}".encode()
                ).decode()
                headers["Authorization"] = f"Basic {creds}"

        # Body
        if request.body and request.body.type != "none":
            if request.body.type == "raw_json":
                headers["Content-Type"] = "application/json"
                lines.append(f"  body: JSON.stringify({request.body.content or '{}'}),")
            elif request.body.type == "raw_text":
                headers["Content-Type"] = "text/plain"
                lines.append(f"  body: '{request.body.content or ''}',")
            elif request.body.type == "x_www_form_urlencoded":
                headers["Content-Type"] = "application/x-www-form-urlencoded"
                form_parts = [
                    f"{f.key}={f.value}"
                    for f in (request.body.form_data or [])
                    if f.enabled and f.key
                ]
                lines.append(f"  body: '{('&'.join(form_parts))}',")
            elif request.body.type == "form_data":
                # For FormData, we add separate lines
                lines.insert(0, "const formData = new FormData();")
                for f in (request.body.form_data or []):
                    if f.enabled and f.key:
                        lines.insert(1, f"formData.append('{f.key}', '{f.value}');")
                lines.append("  body: formData,")

        if headers:
            lines.append("  headers: {")
            for key, value in headers.items():
                lines.append(f"    '{key}': '{value}',")
            lines.append("  },")

        lines.append("});")
        lines.append("")
        lines.append("const data = await response.json();")
        lines.append("console.log(data);")

        code = "\n".join(lines)
        return CodegenResponse(language="javascript", code=code)
