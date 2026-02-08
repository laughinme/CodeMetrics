from typing import Annotated

from fastapi import APIRouter, Depends

from core.security import auth_user
from database.relational_db import UoW, User, get_uow
from database.relational_db.tables.scm_integrations import ScmIntegrationInterface
from domain.scm import ScmIntegrationOut


router = APIRouter()


@router.get("/", response_model=list[ScmIntegrationOut])
async def list_integrations(
    user: Annotated[User, Depends(auth_user)],
    uow: Annotated[UoW, Depends(get_uow)],
):
    repo = ScmIntegrationInterface(uow.session)
    integrations = await repo.list_for_user(user.id)
    return [
        ScmIntegrationOut(
            id=i.id,
            provider=i.provider,
            external_id=i.external_id,
            external_login=i.external_login,
            scopes=i.scopes or [],
            created_at=i.created_at,
            updated_at=i.updated_at,
            last_sync_at=i.last_sync_at,
            last_sync_status=i.last_sync_status,
            last_sync_error=i.last_sync_error,
        )
        for i in integrations
    ]
