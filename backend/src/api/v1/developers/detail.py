from __future__ import annotations

from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Path, Query

from domain.metrics import DeveloperDetailSummary
from service.aggregated_metrics import AggregatedMetricsService, get_aggregated_metrics_service

router = APIRouter()


@router.get(
    "/{author_id}/summary",
    response_model=DeveloperDetailSummary,
    summary="Developer detail summary",
)
async def get_developer_summary(
    svc: Annotated[AggregatedMetricsService, Depends(get_aggregated_metrics_service)],
    author_id: UUID = Path(..., description="Developer identifier"),
    since: date = Query(...),
    until: date = Query(...),
    project_id: int | None = Query(None),
    repo_ids: list[UUID] | None = Query(None),
    limit: int = Query(20, ge=0, le=100),
    cursor: str | None = Query(None, description="Cursor for recent commits"),
) -> DeveloperDetailSummary:
    params = svc.create_params(
        since=since,
        until=until,
        project_id=project_id,
        repo_ids=repo_ids,
    )
    return await svc.get_developer_detail(
        author_id=author_id,
        params=params,
        limit=limit,
        cursor=cursor,
    )
