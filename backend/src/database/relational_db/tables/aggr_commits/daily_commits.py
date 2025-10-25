from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base

if TYPE_CHECKING:
    from ..authors.authors_table import Author
    from ..projects.projects_table import Project
    from ..repositories.repositories_table import Repository


class AggAuthorRepoDay(Base):
    __tablename__ = "agg_author_repo_day"

    day: Mapped[date] = mapped_column(Date(), primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    repo_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), primary_key=True
    )
    author_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("authors.id", ondelete="CASCADE"), primary_key=True
    )

    commits: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lines_added: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lines_deleted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    files_changed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    msg_total_len: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    msg_short_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    project: Mapped["Project"] = relationship("Project", lazy="selectin")
    repository: Mapped["Repository"] = relationship("Repository", lazy="selectin")
    author: Mapped["Author"] = relationship("Author", lazy="selectin")

    __table_args__ = (
        Index("idx_ard_project_day", "project_id", "day"),
        Index("idx_ard_author_day", "author_id", "day"),
    )


class AggHourRepoDay(Base):
    __tablename__ = "agg_hour_repo_day"

    day: Mapped[date] = mapped_column(Date(), primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    repo_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), primary_key=True
    )
    hour: Mapped[int] = mapped_column(
        SmallInteger, primary_key=True, comment="Hour of the day (0-23)"
    )

    commits: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lines_added: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lines_deleted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    project: Mapped["Project"] = relationship("Project", lazy="selectin")
    repository: Mapped["Repository"] = relationship("Repository", lazy="selectin")

    __table_args__ = (
        CheckConstraint("hour >= 0 AND hour < 24", name="ck_agg_hour_valid_range"),
        Index("idx_ahrd_project_day", "project_id", "day"),
    )
