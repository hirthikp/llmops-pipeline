import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from backend.config import settings
    from backend.database import Base, engine
    from backend.routers.execution_router import router as execution_router
    from backend.routers.prompt_router import router as prompt_router
    from backend.schemas import HealthResponse
except ModuleNotFoundError as exc:
    if exc.name != "backend":
        raise
    from config import settings
    from database import Base, engine
    from routers.execution_router import router as execution_router
    from routers.prompt_router import router as prompt_router
    from schemas import HealthResponse


logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO)
)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)

# ✅ Proper CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "validation_error", "detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.exception("Unhandled server error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "internal_server_error",
            "detail": "Unexpected server error.",
        },
    )


app.include_router(prompt_router, prefix=settings.api_prefix)
app.include_router(execution_router, prefix=settings.api_prefix)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        environment=settings.environment,
    )