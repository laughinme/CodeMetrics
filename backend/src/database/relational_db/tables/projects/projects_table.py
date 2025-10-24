from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..mixins import ExternalTimestampMixin
from ..table_base import Base

if TYPE_CHECKING:
    from ..repositories.repositories_table import Repository


class Project(Base, ExternalTimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        comment="Matches swagger Project.id",
    )
    name: Mapped[str] = mapped_column(
        String, nullable=False, unique=True, comment="Project key, surfaced as swagger Project.name",
    )
    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    lfs_allow: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_favorite: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
    )
    permissions: Mapped[dict[str, bool]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Holds swagger permissions payload",
    )

    parent: Mapped["Project | None"] = relationship(
        remote_side="Project.id",
        back_populates="children",
        lazy="selectin",
    )
    children: Mapped[list["Project"]] = relationship(
        back_populates="parent",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    repositories: Mapped[list["Repository"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    @property
    def repo_count(self) -> int:
        return len(self.repositories)

    @property
    def last_activity_at(self) -> datetime | None:
        if not self.repositories:
            return None
        
        valid_dates = [repo.updated_at for repo in self.repositories if repo.updated_at is not None]
        if not valid_dates:
            return None
            
        return max(valid_dates)
