import uuid

from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import mapped_column, relationship, Mapped

from ..table_base import Base
from ..mixins import TimestampMixin

if TYPE_CHECKING:
    from ..repositories.repositories_table import Repository

class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)

    repositories: Mapped[list["Repository"]] = relationship(
        back_populates="project", 
        cascade="all, delete-orphan"
    )