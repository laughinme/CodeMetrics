from fastapi import APIRouter


def get_metrics_router() -> APIRouter:
    from .kpi import router as kpi_router
    from .сommits import get_commits_router

    router = APIRouter(prefix="/metrics", tags=["Metrics"])

    router.include_router(kpi_router)
    router.include_router(get_commits_router())

    return router
