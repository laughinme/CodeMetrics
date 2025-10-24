from typing import Annotated

from fastapi import APIRouter, Path, Depends

from database.relational_db import User
from core.security import auth_user
from service.entities import EntityService, get_entity_service
from domain.entities import ProjectOut

router = APIRouter()

@router.get(
    path="/",
    response_model=ProjectOut,
)
async def get_project_by_id(
    project_id: Annotated[int, Path(description="Project id")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[EntityService, Depends(get_entity_service)],
): 
    project = await svc.get_project(project_id=project_id)
    return project
