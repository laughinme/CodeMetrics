import uuid

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import mapped_column, relationship, Mapped

from ..table_base import Base

if TYPE_CHECKING:
    from ..commits.commits_table import Commit

class Author(Base):
    __tablename__ = "authors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    name: Mapped[str] = mapped_column(String, nullable=False)
    email_normalized: Mapped[str] = mapped_column(String, nullable=False)

    commits: Mapped[list["Commit"]] = relationship(back_populates="author")