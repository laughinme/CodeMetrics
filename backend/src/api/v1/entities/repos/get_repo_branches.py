from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path
from uuid import UUID

from core.security import auth_user
from database.relational_db import User
from domain.entities.branch_model import BranchOut
from service.entities import EntityService, get_entity_service

router = APIRouter()

@router.get(
    path="/{repo_id}/branches",
    response_model=list[BranchOut],
)
async def get_repo_branches(
    repo_id: Annotated[UUID, Path(description="Repository identifier")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[EntityService, Depends(get_entity_service)],
):
    branches = await svc.list_repo_branches(repo_id)
    if branches is None:
        raise HTTPException(status_code=404, detail="Repository not found")
    return branches
