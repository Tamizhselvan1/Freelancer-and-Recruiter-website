# main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import sys

# Initialize FastAPI app
app = FastAPI(
    title="Backend Error Handling Demo",
    description="A FastAPI application demonstrating robust error handling."
)

# --- Custom Exception Classes ---
class AppException(Exception):
    """Base class for application-specific exceptions."""
    def __init__(self, name: str, status_code: int = 500, context: dict = None):
        self.name = name
        self.status_code = status_code
        self.context = context or {}

# --- Custom Exception Handlers ---

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler for FastAPI's built-in HTTPException (4xx/5xx errors)."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.status_code,
            "message": exc.detail,
            "details": exc.headers # HTTPException details can be in headers
        },
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler for automatic validation errors (e.g., Pydantic errors, 422 Unprocessable Entity)."""
    # FastAPI automatically generates a helpful body for this error type
    return JSONResponse(
        status_code=422,
        content={
            "error_code": 422,
            "message": "Validation error in the request data.",
            "details": exc.errors()
        },
    )

async def app_exception_handler(request: Request, exc: AppException):
    """Handler for custom, application-defined exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.status_code,
            "message": f"An application error occurred: {exc.name}",
            "details": exc.context
        },
    )

async def generic_exception_handler(request: Request, exc: Exception):
    """Handler for all other unexpected, generic Python exceptions (500 Internal Server Error)."""
    # Log the full exception for debugging in the console/logs
    print(f"FATAL unhandled exception: {exc}", file=sys.stderr)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": 500,
            "message": "An unexpected internal server error occurred.",
            "details": str(exc) # Provide generic error string, avoid sensitive info
        },
    )

# Register the handlers with the application instance
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(AppException, app_exception_handler)
# Catch all other unhandled exceptions as a generic 500
app.add_exception_handler(Exception, generic_exception_handler)


# --- Example Endpoints ---

@app.get("/items/{item_id}")
def read_item(item_id: int):
    # Example 1: Raising a built-in HTTPException
    if item_id == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item_id": item_id, "status": "found"}

@app.get("/trigger_app_error")
def trigger_app_error():
    # Example 2: Raising a custom application exception
    raise AppException(
        name="DatabaseConnectionError",
        status_code=503,
        context={"db_name": "users_db", "reason": "Timeout"}
    )

@app.get("/trigger_generic_error")
def trigger_generic_error():
    # Example 3: Raising a generic, unhandled Python error (will be caught by generic_exception_handler)
    1 / 0
    return {"message": "This line will not be reached"}

