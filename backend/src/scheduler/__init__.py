import logging
from datetime import datetime, timedelta, UTC

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from core.config import Settings
from .parsing import run_initial_projects_sync
from .scm_sync import run_scm_integrations_sync


logger = logging.getLogger(__name__)


def init_scheduler(
    config: Settings,
) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    api_base_url = config.API_URL
    if not config.EXTERNAL_API_SYNC_ENABLED:
        api_base_url = ""

    if not api_base_url:
        logger.warning(
            "External API base URL is not configured; skipping initial sync job registration"
        )
    else:
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

    if config.SCM_SYNC_ENABLED:
        scheduler.add_job(
            func=run_scm_integrations_sync,
            trigger="interval",
            seconds=max(30, int(config.SCM_SYNC_INTERVAL_SECONDS)),
            id="scm-integrations-auto-sync",
            misfire_grace_time=60,
            coalesce=True,
            max_instances=1,
            replace_existing=True,
        )
    return scheduler
