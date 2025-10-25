from fastapi import APIRouter

from .summary import router as summary_router
from .detail import router as detail_router
from .commits import router as commits_router


def get_developers_router() -> APIRouter:
    router = APIRouter(prefix="/developers", tags=["Developers"])
    router.include_router(summary_router)
    router.include_router(detail_router)
    router.include_router(commits_router)
    return router
