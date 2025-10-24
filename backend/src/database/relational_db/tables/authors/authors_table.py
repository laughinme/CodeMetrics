from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base

if TYPE_CHECKING:
    from ..commits.commits_table import Commit

class Author(Base):
    __tablename__ = "authors"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)

    git_name: Mapped[str] = mapped_column(String, nullable=False)
    git_email: Mapped[str] = mapped_column(String, nullable=False)
    email_normalized: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    first_commit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_commit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    authored_commits: Mapped[list["Commit"]] = relationship(
        back_populates="author",
        foreign_keys="Commit.author_id",
        lazy="selectin",
    )
    committed_commits: Mapped[list["Commit"]] = relationship(
        back_populates="committer",
        foreign_keys="Commit.committer_id",
        lazy="selectin",
    )
