from uuid import UUID, uuid4
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base

if TYPE_CHECKING:
    from ..commits.commits_table import Commit

class CommitFile(Base):
    __tablename__ = "commit_files"

    change_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    commit_sha: Mapped[str] = mapped_column(
        ForeignKey("commits.sha", ondelete="CASCADE"), 
        nullable=False
    )
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    added_lines: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    deleted_lines: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String, nullable=False)

    commit: Mapped["Commit"] = relationship(back_populates="files", lazy="selectin")
