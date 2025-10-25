import logging
from datetime import datetime, timedelta, UTC

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .parsing import run_initial_projects_sync


logger = logging.getLogger(__name__)


def init_scheduler(
    api_base_url: str,
) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    if not api_base_url:
        logger.warning(
            "External API base URL is not configured; skipping initial sync job registration"
        )
        return scheduler

    scheduler.add_job(
        func=run_initial_projects_sync,
        trigger="date",
        run_date=datetime.now(UTC) + timedelta(seconds=3),
        id="external-api-initial-sync",
        kwargs={
            "base_url": api_base_url,
        },
        misfire_grace_time=60,
        coalesce=True,
        max_instances=1,
        replace_existing=True,
    )
    return scheduler
