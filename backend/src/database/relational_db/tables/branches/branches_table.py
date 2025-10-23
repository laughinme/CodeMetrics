from uuid import UUID, uuid4

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base

if TYPE_CHECKING:
    from ..repositories.repositories_table import Repository
    from ..commits.commits_table import Commit

class Branch(Base):
    __tablename__ = "branches"
    __table_args__ = (
        UniqueConstraint("repo_id", "name", name="uq_branch_repo_name"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    repo_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    head_commit_sha: Mapped[str | None] = mapped_column(
        String, ForeignKey("commits.sha", ondelete="SET NULL"), nullable=True,
    )

    repository: Mapped["Repository"] = relationship(back_populates="branches")
    head_commit: Mapped["Commit | None"] = relationship(
        back_populates="branches",
        lazy="selectin",
    )
