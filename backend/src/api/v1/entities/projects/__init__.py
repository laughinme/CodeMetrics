from fastapi import APIRouter

def get_projects_routes() -> APIRouter:
    from .get_projects import router as get_projects_router
    from .project_key import get_project_key_routes

    router = APIRouter(prefix="/projects")

    router.include_router(get_projects_router)
    router.include_router(get_project_key_routes())

    return router
