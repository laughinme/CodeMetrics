from typing import Annotated

from fastapi import APIRouter, Depends

from database.relational_db import User
from core.security import auth_user
from service.entities import EntityService, get_entity_service
from domain.entities.project_model import ProjectDTO

router = APIRouter()

@router.get(
    path="/",
    response_model=ProjectDTO,
)
async def get_projects(
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[EntityService, Depends(get_entity_service)],
): 
    projects = await svc.list_projects()
    return projects
