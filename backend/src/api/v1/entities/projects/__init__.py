from fastapi import APIRouter

def get_projects_routes() -> APIRouter:
    from .get_projects import router as get_projects_router
    from .project_id import get_project_id_routes

    router = APIRouter()

    router.include_router(get_projects_router, prefix="/projects")
    router.include_router(get_project_id_routes(), prefix="/projects")

    return router
