from __future__ import annotations

from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from domain.metrics import TimelineSummary
from service.aggregated_metrics import AggregatedMetricsService, get_aggregated_metrics_service

router = APIRouter()


@router.get(
    "/timeline/summary",
    response_model=TimelineSummary,
    summary="Timeline metrics summary",
)
async def get_timeline_summary(
    svc: Annotated[AggregatedMetricsService, Depends(get_aggregated_metrics_service)],
    since: date = Query(...),
    until: date = Query(...),
    project_id: int | None = Query(None),
    repo_ids: list[UUID] | None = Query(None),
    author_ids: list[UUID] | None = Query(None),
) -> TimelineSummary:
    params = svc.create_params(
        since=since,
        until=until,
        project_id=project_id,
        repo_ids=repo_ids,
        author_ids=author_ids,
    )
    return await svc.get_timeline_summary(params=params)
