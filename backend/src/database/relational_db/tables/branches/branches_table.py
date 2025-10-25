from uuid import UUID, uuid4

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..table_base import Base
from ..mixins import TimestampMixin

if TYPE_CHECKING:
    from ..repositories.repositories_table import Repository


class Branch(Base, TimestampMixin):
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
    is_protected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    repository: Mapped["Repository"] = relationship(back_populates="branches")
