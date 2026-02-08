from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path

from core.security import auth_user
from database.relational_db import UoW, User, get_uow
from database.relational_db.tables.scm_integrations import ScmIntegrationInterface
from service.scm_sync.runner import sync_integration_background

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/{integration_id}/sync")
async def sync_integration(
    integration_id: Annotated[UUID, Path(description="Integration id")],
    user: Annotated[User, Depends(auth_user)],
    uow: Annotated[UoW, Depends(get_uow)],
):
    repo = ScmIntegrationInterface(uow.session)
    integration = await repo.get_for_user(user.id, integration_id)
    if integration is None:
        raise HTTPException(status_code=404, detail="Integration not found")

    if integration.provider != "github":
        raise HTTPException(status_code=400, detail="Unsupported provider for sync")

    # Queue background sync. We don't run the full sync in-request to avoid timeouts.
    integration.last_sync_status = "queued"
    integration.last_sync_error = None
    integration.last_sync_at = datetime.now(UTC)
    await uow.commit()

    try:
        asyncio.create_task(sync_integration_background(integration.id))
    except Exception:
        logger.exception("Failed to schedule integration sync")
        raise HTTPException(status_code=500, detail="Failed to schedule sync")

    return {"status": "started"}
