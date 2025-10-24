from typing import Optional

from uuid import UUID, uuid4
from datetime import date, datetime

from core.config import Settings
from database.relational_db import (
    ProjectInterface,
    Project,
    Repository,
    UoW,
    User,
)

settings = Settings()  # type: ignore


class EntityService:
    def __init__(
        self,
        uow: UoW,
        project_repo: ProjectInterface,
    ):
        self.uow = uow
        self.project_repo = project_repo
        
    async def get_project(self, project_key: str) -> Optional[Project]:
        return await self.project_repo.get_by_name(project_key)
    
    async def list_projects(self) -> list[Project]:
        return await self.project_repo.list_all()

    async def get_project_repos(self, project_key: str) -> list[Repository]:
        return await self.project_repo.get_repos(project_key)