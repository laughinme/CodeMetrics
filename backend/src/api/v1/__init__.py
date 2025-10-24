from fastapi import APIRouter


def get_v1_router() -> APIRouter:
    from .auth import get_auth_routers
    from .users import get_users_router
    from .misc import get_misc_router
    from .entities import get_entities_router
    
    router = APIRouter(prefix='/v1')

    router.include_router(get_auth_routers())
    router.include_router(get_users_router())
    router.include_router(get_misc_router())
    router.include_router(get_entities_router())
    
    return router
