import uuid

from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, Integer, Boolean, DateTime
from sqlalchemy.orm import mapped_column, relationship, Mapped

from ..table_base import Base

if TYPE_CHECKING:
    from ..repositories.repositories_table import Repository
    from ..authors.authors_table import Author
    from ..commitfiles.commitfiles_table import CommitFile

class Commit(Base):
    __tablename__ = "commits"

    sha: Mapped[str] = mapped_column(String, primary_key=True)
    repo_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("repositories.id", ondelete="CASCADE"), 
        nullable=False
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("authors.id", ondelete="SET NULL"), 
        nullable=True
    )
    committed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    message: Mapped[str | None] = mapped_column(Text)
    added_lines: Mapped[int] = mapped_column(Integer, default=0)
    deleted_lines: Mapped[int] = mapped_column(Integer, default=0)
    is_merge_guess: Mapped[bool] = mapped_column(Boolean, default=False)

    repository: Mapped["Repository"] = relationship(back_populates="commits")
    author: Mapped["Author | None"] = relationship(back_populates="commits")
    files: Mapped[list["CommitFile"]] = relationship(
        back_populates="commit", 
        cascade="all, delete-orphan"
    )