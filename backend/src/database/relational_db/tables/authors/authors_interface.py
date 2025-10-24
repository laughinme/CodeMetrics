from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from domain.parsing.schemas.author import GitUser

from .authors_table import Author


def normalize_email(email: str) -> str:
    return email.strip().lower()


class AuthorInterface:
    """Helpers to fetch or create author entities."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create(self, user: GitUser | None) -> Author | None:
        if user is None or not user.email:
            return None

        normalized = normalize_email(user.email)
        stmt = select(Author).where(Author.email_normalized == normalized)
        author = await self.session.scalar(stmt)

        if author is None:
            author = Author(
                git_name=user.name or user.email,
                git_email=user.email,
                email_normalized=normalized,
            )
            self.session.add(author)
        else:
            if user.name and author.git_name != user.name:
                author.git_name = user.name
            if author.git_email != user.email:
                author.git_email = user.email

        return author

    async def touch_commit_window(self, author: Author | None, created_at: datetime) -> None:
        if author is None:
            return

        if author.first_commit_at is None or created_at < author.first_commit_at:
            author.first_commit_at = created_at
        if author.last_commit_at is None or created_at > author.last_commit_at:
            author.last_commit_at = created_at
