from typing import Annotated

from fastapi import APIRouter, Path, Depends

from database.relational_db import User
from core.security import auth_user
from service.entities import EntityService, get_entity_service
from domain.entities.repository_model import RepositoryDTO

router = APIRouter()

@router.get(
    path="/repos",
    response_model=list[RepositoryDTO],
)
async def get_project_repos(
    project_key: Annotated[str, Path(description="Project key (name)")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[EntityService, Depends(get_entity_service)],
): 
    return await svc.get_project_repos(project_key)