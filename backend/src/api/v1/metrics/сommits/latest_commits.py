from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Query, Depends

from service.entities import EntityService
from service.metrics_service.schemas import PaginatedCommits

router = APIRouter()

@router.get(
    "/latest",
    response_model=PaginatedCommits,
    summary="Get latest commits",
    description="Returns paginated list of recent commits with file statistics"
)
async def get_latest_commits(
    project_key: Optional[str] = Query(None, description="Filter by project key"),
    repo: Optional[UUID] = Query(None, description="Filter by repository UUID"),
    author: Optional[UUID] = Query(None, description="Filter by author UUID"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
    commits_service: EntityService = ...,
) -> PaginatedCommits:
    #return await commits_service.get_latest_commits(
    #    project_key=project_key,
    #    repo=repo,
    #    author=author,
    #    limit=limit,
    #    cursor=cursor
    #)
    ...