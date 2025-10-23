import logging
from datetime import datetime, timedelta, UTC

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from service.api_service import ExternalAPIClient, ExternalAPIError


logger = logging.getLogger(__name__)


async def bootstrap_external_api(base_url: str) -> None:
    client = ExternalAPIClient(base_url=base_url)
    try:
        payload = await client.fetch_test_payload()
    except ExternalAPIError as exc:
        logger.error("Bootstrap call to external API failed: %s", exc)
    except Exception:
        logger.exception("Unexpected error while running external API bootstrap job")
    else:
        logger.info("External API bootstrap succeeded with payload: %s", payload)


def init_scheduler(api_base_url: str) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    if not api_base_url:
        logger.warning(
            "External API base URL is not configured; skipping bootstrap job registration"
        )
        return scheduler

    scheduler.add_job(
        func=bootstrap_external_api,
        trigger="date",
        run_date=datetime.now(UTC) + timedelta(seconds=2),
        id="external-api-bootstrap",
        kwargs={"base_url": api_base_url},
        misfire_grace_time=60,
        coalesce=True,
        max_instances=1,
        replace_existing=True,
    )
    return scheduler
