from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from .commitfiles_table import CommitFile


@dataclass
class CommitFilePayload:
    path: str
    status: str
    added_lines: int
    deleted_lines: int
    patch: str
    is_binary: bool
    previous_path: Optional[str] = None


class CommitFileInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def replace_for_commit(
        self,
        commit_sha: str,
        files: Iterable[CommitFilePayload],
    ) -> None:
        await self.session.execute(
            delete(CommitFile).where(CommitFile.commit_sha == commit_sha)
        )

        for payload in files:
            record = CommitFile(
                commit_sha=commit_sha,
                file_path=payload.path,
                status=payload.status,
                added_lines=payload.added_lines,
                deleted_lines=payload.deleted_lines,
                patch=payload.patch,
                is_binary=payload.is_binary,
            )
            self.session.add(record)
