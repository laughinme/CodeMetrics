from typing import Annotated

from fastapi import APIRouter, Path, Depends

from database.relational_db import User
from core.security import auth_user
from service.entities import EntityService, get_entity_service

router = APIRouter()

@router.get(
    path="/",
    response_model=None,
)
async def get_project_by_key(
    project_key: Annotated[str, Path(description="Project key (name)")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[EntityService, Depends(get_entity_service)],
): 
    # TODO: Implement project retrieval logic
    pass
