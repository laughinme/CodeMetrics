from fastapi import APIRouter


def get_metrics_router() -> APIRouter:
    # from .kpi import router as kpi_router
    from .summary import router as summary_router
    from .timeline import router as timeline_router

    router = APIRouter(prefix="/metrics", tags=["Metrics"])

    # router.include_router(kpi_router)
    router.include_router(summary_router)
    router.include_router(timeline_router)

    return router
