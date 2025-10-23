from fastapi import Depends

from database.redis import CacheRepo, get_redis
from database.relational_db import (
    ProjectInterface,
    UoW,
    get_uow,
)
from .entity_service import EntityService


async def get_entity_service(
    uow: UoW = Depends(get_uow),
    # redis = Depends(get_redis),
) -> EntityService:
    project_repo = ProjectInterface(uow.session)
    return EntityService(uow, project_repo)
