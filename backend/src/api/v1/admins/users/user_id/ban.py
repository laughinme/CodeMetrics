from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, HTTPException

from core.security import require_permissions
from database.relational_db import User
from domain.users import UserModel
from domain.auth.enums import SystemPermission
from service.users import UserService, get_user_service

router = APIRouter()


@router.post(
    path='/ban',
    response_model=UserModel,
    summary='Ban or unban a user',
)
async def set_ban(
    user_id: Annotated[UUID, Path(...)],
    _: Annotated[User, Depends(require_permissions(SystemPermission.USERS_BAN))],
    svc: Annotated[UserService, Depends(get_user_service)],
):
    target = await svc.get_user(user_id)
    if target is None:
        raise HTTPException(404, 'User not found')
    updated = await svc.admin_set_ban(target, banned=True)
    return updated
