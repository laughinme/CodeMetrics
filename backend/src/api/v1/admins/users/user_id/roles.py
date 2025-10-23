from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path

from core.security import require_permissions
from database.relational_db import User
from domain.auth.enums import SystemPermission
from domain.users import UserModel, UserRolesUpdate
from service.users import UserService, get_user_service

router = APIRouter()


@router.put(
    path="/roles",
    response_model=UserModel,
    summary="Assign roles to user",
)
async def set_roles(
    payload: UserRolesUpdate,
    user_id: Annotated[UUID, Path(...)],
    _: Annotated[
        User,
        Depends(require_permissions(SystemPermission.USERS_MANAGE_ROLES)),
    ],
    svc: Annotated[UserService, Depends(get_user_service)],
):
    target = await svc.get_user(user_id)
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")

    updated = await svc.admin_assign_roles(target, payload.roles)
    return updated
