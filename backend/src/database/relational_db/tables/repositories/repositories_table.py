from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import mapped_column, relationship, Mapped
from typing import TYPE_CHECKING
import uuid

from ..table_base import Base
from ..mixins import TimestampMixin

if TYPE_CHECKING:
    from ..projects.projects_table import Project
    from ..branches.branches_table import Branch
    from ..commits.commits_table import Commit

class Repository(Base, TimestampMixin):
    __tablename__ = "repositories"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), 
        nullable=False
    )

    name: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False)
    default_branch: Mapped[str] = mapped_column(Text, nullable=False)

    project: Mapped["Project"] = relationship(back_populates="repositories")
    branches: Mapped[list["Branch"]] = relationship(
        back_populates="repository", 
        cascade="all, delete-orphan"
    )
    commits: Mapped[list["Commit"]] = relationship(
        back_populates="repository", 
        cascade="all, delete-orphan"
    )