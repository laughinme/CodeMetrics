from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .projects_table import Project


class ProjectInterface:
    """
    Repository for Project entities.
    Provides minimal upsert helpers needed by the external sync workflow.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert_by_name(
        self,
        *,
        name: str,
        full_name: str,
        description: str | None = None,
    ) -> Project:
        project = await self.session.scalar(
            select(Project).where(Project.name == name)
        )

        if project is None:
            project = Project(
                name=name,
                full_name=full_name,
                description=description,
            )
            self.session.add(project)
            await self.session.flush()
            return project

        updated = False
        if project.full_name != full_name:
            project.full_name = full_name
            updated = True
        if description is not None and project.description != description:
            project.description = description
            updated = True

        if updated:
            await self.session.flush()

        return project
