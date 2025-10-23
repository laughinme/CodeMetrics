import uuid

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base

if TYPE_CHECKING:
    from ..authors.authors_table import Author
    from ..branches.branches_table import Branch
    from ..commitfiles.commitfiles_table import CommitFile
    from ..repositories.repositories_table import Repository


class Commit(Base):
    __tablename__ = "commits"

    sha: Mapped[str] = mapped_column(String, primary_key=True)
    repo_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("authors.id", ondelete="SET NULL"),
        nullable=True,
    )
    committer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("authors.id", ondelete="SET NULL"),
        nullable=True,
    )

    message: Mapped[str] = mapped_column(Text, nullable=False)

    branch_names: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
        default=list,
    )
    tag_names: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
        default=list,
    )
    added_lines: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    deleted_lines: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_merge_commit: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    diff_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    committed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    repository: Mapped["Repository"] = relationship(back_populates="commits")
    author: Mapped["Author | None"] = relationship(
        foreign_keys=[author_id],
        back_populates="authored_commits",
        lazy="selectin",
    )
    committer: Mapped["Author | None"] = relationship(
        foreign_keys=[committer_id],
        back_populates="committed_commits",
        lazy="selectin",
    )
    branches: Mapped[list["Branch"]] = relationship(
        back_populates="head_commit",
        lazy="selectin",
    )
    files: Mapped[list["CommitFile"]] = relationship(
        back_populates="commit",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
