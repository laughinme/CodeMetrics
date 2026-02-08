from fastapi import APIRouter


def get_integrations_router() -> APIRouter:
    from .list_integrations import router as list_router
    from .github_oauth import router as github_router
    from .sync_integration import router as sync_router

    router = APIRouter(tags=["integrations"])

    # list_router is mounted at /integrations (no trailing slash)
    router.include_router(list_router)
    router.include_router(github_router, prefix="/integrations")
    router.include_router(sync_router, prefix="/integrations")

    return router
