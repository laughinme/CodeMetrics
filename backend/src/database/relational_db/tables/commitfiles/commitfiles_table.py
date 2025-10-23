import uuid

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text, Integer
from sqlalchemy.orm import mapped_column, relationship, Mapped

from ..table_base import Base

if TYPE_CHECKING:
    from ..commits.commits_table import Commit

class CommitFile(Base):
    __tablename__ = "commit_files"

    change_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    commit_sha: Mapped[str] = mapped_column(
        ForeignKey("commits.sha", ondelete="CASCADE"), 
        nullable=False
    )
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    added_lines: Mapped[int] = mapped_column(Integer, default=0)
    deleted_lines: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, nullable=False)

    commit: Mapped["Commit"] = relationship(back_populates="files")