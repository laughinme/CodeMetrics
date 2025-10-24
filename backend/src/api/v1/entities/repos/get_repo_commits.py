from typing import Annotated

from fastapi import APIRouter, Depends, Path

from database.relational_db import User
from core.security import auth_user
from service.entities import EntityService, get_entity_service
from domain.entities import CommitOut

router = APIRouter()

@router.get(
    path="/{project_key}/{repo}/commits",
    response_model=list[CommitOut],
)
async def get_repo_commits(
    project_key: Annotated[str, Path(description="Project key (name)")],
    repo: Annotated[str, Path(description="Repository name")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[EntityService, Depends(get_entity_service)],
):
    # return await svc.list_repo_commits(project_key, repo)
    pass
