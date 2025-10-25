from __future__ import annotations

from datetime import date
from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Date, Enum as SAEnum, ForeignKey, Index, Integer, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base

if TYPE_CHECKING:
    from ..projects.projects_table import Project
    from ..repositories.repositories_table import Repository


class SizeBucket(str, Enum):
    ZERO_TEN = "0-10"
    ELEVEN_FIFTY = "11-50"
    FIFTY_ONE_HUNDRED = "51-100"
    HUNDRED_PLUS = "100+"


class AggSizeBucketRepoDay(Base):
    __tablename__ = "agg_size_bucket_repo_day"

    day: Mapped[date] = mapped_column(Date(), primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    repo_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), primary_key=True
    )
    bucket: Mapped[SizeBucket] = mapped_column(
        SAEnum(SizeBucket, name="size_bucket"), primary_key=True
    )

    cnt: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    project: Mapped["Project"] = relationship("Project", lazy="selectin")
    repository: Mapped["Repository"] = relationship("Repository", lazy="selectin")

    __table_args__ = (
        Index("idx_asbrd_project_day", "project_id", "day"),
    )
