from __future__ import annotations

from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Path, Query

from domain.metrics import CommitFeed
from service.aggregated_metrics import AggregatedMetricsService, get_aggregated_metrics_service

router = APIRouter()


@router.get(
    "/{author_id}/commits",
    response_model=CommitFeed,
    summary="Developer recent commits",
)
async def get_developer_commits(
    svc: Annotated[AggregatedMetricsService, Depends(get_aggregated_metrics_service)],
    author_id: UUID = Path(...),
    since: date = Query(...),
    until: date = Query(...),
    project_id: int | None = Query(None),
    repo_ids: list[UUID] | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
) -> CommitFeed:
    params = svc.create_params(
        since=since,
        until=until,
        project_id=project_id,
        repo_ids=repo_ids,
    )
    return await svc.get_developer_commits(
        author_id=author_id,
        params=params,
        limit=limit,
        cursor=cursor,
    )
