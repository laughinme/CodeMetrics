from typing import Annotated

from fastapi import APIRouter, Path, Depends

from database.relational_db import User
from core.security import auth_user
from service.entities import EntityService, get_entity_service
from domain.entities import RepositoryOut

router = APIRouter()

@router.get(
    path="/repos",
    response_model=list[RepositoryOut],
)
async def get_project_repos(
    project_id: Annotated[int, Path(description="Project id")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[EntityService, Depends(get_entity_service)],
): 
    return await svc.get_project_repos(project_id)
