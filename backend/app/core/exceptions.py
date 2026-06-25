"""Custom exception classes and handlers."""

from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Resource not found."""

    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            message=f"{resource} with id '{resource_id}' not found",
            status_code=404,
        )


class ProxyRequestError(AppException):
    """Error executing proxied HTTP request."""

    def __init__(self, message: str):
        super().__init__(message=message, status_code=502)


class ValidationError(AppException):
    """Custom validation error."""

    def __init__(self, message: str):
        super().__init__(message=message, status_code=422)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle custom application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )
