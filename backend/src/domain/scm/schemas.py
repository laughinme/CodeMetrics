from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ScmIntegrationOut(BaseModel):
    id: UUID
    provider: str = Field(..., examples=["github"])
    external_id: str | None = None
    external_login: str | None = None
    scopes: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime | None = None
    last_sync_at: datetime | None = None
    last_sync_status: str | None = None
    last_sync_error: str | None = None

