from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Date, ForeignKey, Index, Integer, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base

if TYPE_CHECKING:
    from ..projects.projects_table import Project
    from ..repositories.repositories_table import Repository


class AggFileRepoDay(Base):
    __tablename__ = "agg_file_repo_day"

    day: Mapped[date] = mapped_column(Date(), primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    repo_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), primary_key=True
    )
    path: Mapped[str] = mapped_column(Text, primary_key=True)

    commits_touch: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lines_added: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lines_deleted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    churn: Mapped[int] = mapped_column(Integer, nullable=False, default=0, comment="added+deleted")

    project: Mapped["Project"] = relationship("Project", lazy="selectin")
    repository: Mapped["Repository"] = relationship("Repository", lazy="selectin")

    __table_args__ = (
        Index("idx_afrd_project_day", "project_id", "day"),
        Index("idx_afrd_churn", "repo_id", "churn", postgresql_using="btree"),
    )
