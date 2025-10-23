from uuid import UUID, uuid4
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base
from ..mixins import ExternalTimestampMixin

if TYPE_CHECKING:
    from ..projects.projects_table import Project
    from ..branches.branches_table import Branch
    from ..commits.commits_table import Commit

class Repository(Base, ExternalTimestampMixin):
    __tablename__ = "repositories"
    __table_args__ = (
        UniqueConstraint("project_id", "name", name="uq_repository_project_name"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    topics: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    default_branch: Mapped[str | None] = mapped_column(String, nullable=True)
    permissions: Mapped[dict[str, bool]] = mapped_column(
        JSONB, nullable=False, default=dict
    )

    # Relationships
    project: Mapped["Project"] = relationship(back_populates="repositories", lazy="selectin")
    branches: Mapped[list["Branch"]] = relationship(
        back_populates="repository", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    commits: Mapped[list["Commit"]] = relationship(
        back_populates="repository", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
