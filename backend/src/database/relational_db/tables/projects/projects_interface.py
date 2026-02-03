from typing import TYPE_CHECKING

from sqlalchemy import select
from sqlalchemy.orm import load_only, noload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from domain.parsing import ProjectModel

from .projects_table import Project
from ..repositories import Repository


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
        project.is_public = model.is_public
        project.lfs_allow = model.lfs_allow
        project.is_favorite = model.is_favorite
        project.parent_id = model.parent_id
        project.permissions = model.permissions or {}
        project.created_at = model.created_at
        project.updated_at = model.updated_at

        return project
    
    async def get_by_name(self, name: str) -> Project | None:
        stmt = select(Project).where(Project.name == name)
        return await self.session.scalar(stmt)
    
    async def get_by_id(self, id: int) -> Project | None:
        stmt = (
            select(Project)
            .where(Project.id == id)
            .options(
                selectinload(Project.repositories).options(
                    load_only(
                        Repository.id,
                        Repository.project_id,
                        Repository.updated_at,
                    ),
                    noload(Repository.commits),
                    noload(Repository.branches),
                    noload(Repository.project),
                )
            )
        )
        return await self.session.scalar(stmt)
    
    async def list_all(self) -> list[Project]:
        stmt = select(Project).options(
            selectinload(Project.repositories).options(
                load_only(
                    Repository.id,
                    Repository.project_id,
                    Repository.updated_at,
                ),
                noload(Repository.commits),
                noload(Repository.branches),
                noload(Repository.project),
            )
        )
        rows = await self.session.scalars(stmt)
        return list(rows.all())

    async def get_repos(self, project_id: int) -> list[Repository]:
        rows = await self.session.scalars(
            select(Repository)
            .where(Repository.project_id == project_id)
            .options(
                load_only(
                    Repository.id,
                    Repository.project_id,
                    Repository.name,
                    Repository.default_branch,
                    Repository.description,
                    Repository.updated_at,
                ),
                noload(Repository.commits),
                noload(Repository.branches),
                noload(Repository.project),
            )
        )
        return list(rows.all())
