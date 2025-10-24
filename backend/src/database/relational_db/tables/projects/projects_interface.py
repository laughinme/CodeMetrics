from typing import TYPE_CHECKING

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from domain.parsing.schemas.projects import ProjectModel

from .projects_table import Project

if TYPE_CHECKING:
    from ..repositories.repositories_table import Repository


class ProjectInterface:
    """Repository helpers for project entities."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert_from_model(self, model: ProjectModel) -> Project:
        project = await self.session.scalar(
            select(Project).where(Project.name == model.name)
        )

        if project is None:
            project = Project(
                name=model.name,
                full_name=model.full_name,
            )
            self.session.add(project)

        project.full_name = model.full_name
        project.description = model.description
        project.parent_id = model.parent_id
        project.permissions = model.permissions or {}
        project.created_at = model.created_at
        project.updated_at = model.updated_at

        return project
    
    async def get_by_name(self, name: str) -> Project | None:
        stmt = select(Project).where(Project.name == name)
        return await self.session.scalar(stmt)
    
    async def list_all(self) -> list[Project]:
        rows = await self.session.scalars(select(Project))
        return list(rows)

    async def get_repos(self, name: str) -> list["Repository"]:
        stmt = select(Project).where(Project.name == name)
        project = await self.session.scalar(stmt)
        return project.repositories
