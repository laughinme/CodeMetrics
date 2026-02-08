from __future__ import annotations

import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path

from datetime import datetime, UTC

from core.secrets import decrypt_str, SecretEncryptionError
from core.security import auth_user
from database.relational_db import UoW, User, get_uow
from database.relational_db.tables.scm_integrations import ScmIntegrationInterface
from service.scm_providers.github_client import GitHubClient
from service.scm_sync.github_sync import GitHubSyncService

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

    try:
        access_token = decrypt_str(integration.access_token_enc)
    except SecretEncryptionError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        client = GitHubClient(access_token)
        sync = GitHubSyncService(client=client, uow=uow)
        await sync.sync_orgs(integration_id=integration.id)

        integration.last_sync_status = "ok"
        integration.last_sync_error = None
        integration.last_sync_at = datetime.now(UTC)
    except Exception as exc:
        logger.exception("Integration sync failed")
        integration.last_sync_status = "error"
        integration.last_sync_error = str(exc)[:2000]
        integration.last_sync_at = datetime.now(UTC)
        raise
    finally:
        await uow.commit()

    return {"status": "ok"}
