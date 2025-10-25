from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query

from core.security import auth_user
from database.relational_db import User
from domain.entities import BranchOut, Page
from service.entities import EntityService, get_entity_service

router = APIRouter()

@router.get(
    path="/{repo_id}/branches",
    response_model=Page[BranchOut],
)
async def get_repo_branches(
    repo_id: Annotated[UUID, Path(description="Repository identifier")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[EntityService, Depends(get_entity_service)],
    limit: int = Query(50, ge=1, le=500),
    cursor: str | None = Query(None, description="Cursor token returned in previous response"),
):
    page = await svc.list_repo_branches(repo_id, limit=limit, cursor=cursor)
    if page is None:
        raise HTTPException(status_code=404, detail="Repository not found")
    return page
