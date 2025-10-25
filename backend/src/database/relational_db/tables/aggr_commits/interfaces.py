from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any, Iterable, Sequence
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

from ..authors.authors_table import Author
from ..aggr_files.hot_files_daily import AggFileRepoDay
from .commit_size import AggSizeBucketRepoDay, SizeBucket
from .daily_commits import AggAuthorRepoDay, AggHourRepoDay


@dataclass(slots=True)
class AggregationFilter:
    since: date | None = None
    until: date | None = None
    project_id: int | None = None
    repo_ids: Sequence[UUID] | None = None
    author_ids: Sequence[UUID] | None = None


@dataclass(slots=True)
class KPIResult:
    commits: int
    active_devs: int
    active_repos: int


@dataclass(slots=True)
class DailyCommitsPoint:
    day: date
    commits: int


@dataclass(slots=True)
class HourHeatmapPoint:
    hour: int
    commits: int
    lines_added: int
    lines_deleted: int


@dataclass(slots=True)
class WeekdayHeatmapPoint:
    weekday: int  # 0=Sunday .. 6=Saturday (PostgreSQL DOW convention)
    commits: int


@dataclass(slots=True)
class TopAuthorRow:
    author_id: UUID
    commits: int
    lines: int
    git_name: str | None
    git_email: str | None


@dataclass(slots=True)
class MessageQualityStats:
    avg_length: float
    short_pct: float
    total_commits: int


@dataclass(slots=True)
class SizeHistogramBin:
    bucket: SizeBucket
    count: int


@dataclass(slots=True)
class SizeHistogramStats:
    histogram: list[SizeHistogramBin]
    approx_avg_churn: float | None
    approx_median_churn: float | None


@dataclass(slots=True)
class HotFileRow:
    path: str
    commits_touch: int
    lines_added: int
    lines_deleted: int
    churn: int


@dataclass(slots=True)
class AuthorRepoDayDelta:
    day: date
    project_id: int
    repo_id: UUID
    author_id: UUID
    commits: int
    lines_added: int
    lines_deleted: int
    files_changed: int
    msg_total_len: int
    msg_short_count: int


@dataclass(slots=True)
class HourRepoDayDelta:
    day: date
    project_id: int
    repo_id: UUID
    hour: int
    commits: int
    lines_added: int
    lines_deleted: int


@dataclass(slots=True)
class SizeBucketDelta:
    day: date
    project_id: int
    repo_id: UUID
    bucket: SizeBucket
    cnt: int


@dataclass(slots=True)
class FileRepoDayDelta:
    day: date
    project_id: int
    repo_id: UUID
    path: str
    commits_touch: int
    lines_added: int
    lines_deleted: int
    churn: int


class AggregateMetricsInterface:
    _BUCKET_CENTERS: dict[SizeBucket, float] = {
        SizeBucket.ZERO_TEN: 5.0,
        SizeBucket.ELEVEN_FIFTY: 30.5,
        SizeBucket.FIFTY_ONE_HUNDRED: 75.5,
        SizeBucket.HUNDRED_PLUS: 125.0,
    }

    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert_author_repo_day(self, rows: Iterable[AuthorRepoDayDelta]) -> None:
        merged_rows = self._merge_author_rows(rows)
        if not merged_rows:
            return

        payload = [
            {
                "day": row.day,
                "project_id": row.project_id,
                "repo_id": row.repo_id,
                "author_id": row.author_id,
                "commits": row.commits,
                "lines_added": row.lines_added,
                "lines_deleted": row.lines_deleted,
                "files_changed": row.files_changed,
                "msg_total_len": row.msg_total_len,
                "msg_short_count": row.msg_short_count,
            }
            for row in merged_rows
        ]

        stmt = insert(AggAuthorRepoDay).values(payload)
        stmt = stmt.on_conflict_do_update(
            index_elements=[AggAuthorRepoDay.day, AggAuthorRepoDay.repo_id, AggAuthorRepoDay.author_id],
            set_={
                "commits": AggAuthorRepoDay.commits + stmt.excluded.commits,
                "lines_added": AggAuthorRepoDay.lines_added + stmt.excluded.lines_added,
                "lines_deleted": AggAuthorRepoDay.lines_deleted + stmt.excluded.lines_deleted,
                "files_changed": AggAuthorRepoDay.files_changed + stmt.excluded.files_changed,
                "msg_total_len": AggAuthorRepoDay.msg_total_len + stmt.excluded.msg_total_len,
                "msg_short_count": AggAuthorRepoDay.msg_short_count + stmt.excluded.msg_short_count,
            },
        )
        await self.session.execute(stmt)

    async def upsert_hour_repo_day(self, rows: Iterable[HourRepoDayDelta]) -> None:
        merged_rows = self._merge_hour_rows(rows)
        if not merged_rows:
            return

        payload = [
            {
                "day": row.day,
                "project_id": row.project_id,
                "repo_id": row.repo_id,
                "hour": row.hour,
                "commits": row.commits,
                "lines_added": row.lines_added,
                "lines_deleted": row.lines_deleted,
            }
            for row in merged_rows
        ]

        stmt = insert(AggHourRepoDay).values(payload)
        stmt = stmt.on_conflict_do_update(
            index_elements=[AggHourRepoDay.day, AggHourRepoDay.repo_id, AggHourRepoDay.hour],
            set_={
                "commits": AggHourRepoDay.commits + stmt.excluded.commits,
                "lines_added": AggHourRepoDay.lines_added + stmt.excluded.lines_added,
                "lines_deleted": AggHourRepoDay.lines_deleted + stmt.excluded.lines_deleted,
            },
        )
        await self.session.execute(stmt)

    async def upsert_size_buckets(self, rows: Iterable[SizeBucketDelta]) -> None:
        merged_rows = self._merge_size_rows(rows)
        if not merged_rows:
            return

        payload = [
            {
                "day": row.day,
                "project_id": row.project_id,
                "repo_id": row.repo_id,
                "bucket": row.bucket,
                "cnt": row.cnt,
            }
            for row in merged_rows
        ]

        stmt = insert(AggSizeBucketRepoDay).values(payload)
        stmt = stmt.on_conflict_do_update(
            index_elements=[AggSizeBucketRepoDay.day, AggSizeBucketRepoDay.repo_id, AggSizeBucketRepoDay.bucket],
            set_={
                "cnt": AggSizeBucketRepoDay.cnt + stmt.excluded.cnt,
            },
        )
        await self.session.execute(stmt)

    async def upsert_hot_files(self, rows: Iterable[FileRepoDayDelta]) -> None:
        merged_rows = self._merge_file_rows(rows)
        if not merged_rows:
            return

        payload = [
            {
                "day": row.day,
                "project_id": row.project_id,
                "repo_id": row.repo_id,
                "path": row.path,
                "commits_touch": row.commits_touch,
                "lines_added": row.lines_added,
                "lines_deleted": row.lines_deleted,
                "churn": row.churn,
            }
            for row in merged_rows
        ]

        stmt = insert(AggFileRepoDay).values(payload)
        stmt = stmt.on_conflict_do_update(
            index_elements=[AggFileRepoDay.day, AggFileRepoDay.repo_id, AggFileRepoDay.path],
            set_={
                "commits_touch": AggFileRepoDay.commits_touch + stmt.excluded.commits_touch,
                "lines_added": AggFileRepoDay.lines_added + stmt.excluded.lines_added,
                "lines_deleted": AggFileRepoDay.lines_deleted + stmt.excluded.lines_deleted,
                "churn": AggFileRepoDay.churn + stmt.excluded.churn,
            },
        )
        await self.session.execute(stmt)

    @staticmethod
    def _merge_author_rows(rows: Iterable[AuthorRepoDayDelta]) -> list[AuthorRepoDayDelta]:
        merged: dict[tuple[date, int, UUID, UUID], AuthorRepoDayDelta] = {}
        for row in rows:
            key = (row.day, row.project_id, row.repo_id, row.author_id)
            existing = merged.get(key)
            if existing is None:
                merged[key] = AuthorRepoDayDelta(
                    day=row.day,
                    project_id=row.project_id,
                    repo_id=row.repo_id,
                    author_id=row.author_id,
                    commits=row.commits,
                    lines_added=row.lines_added,
                    lines_deleted=row.lines_deleted,
                    files_changed=row.files_changed,
                    msg_total_len=row.msg_total_len,
                    msg_short_count=row.msg_short_count,
                )
            else:
                existing.commits += row.commits
                existing.lines_added += row.lines_added
                existing.lines_deleted += row.lines_deleted
                existing.files_changed += row.files_changed
                existing.msg_total_len += row.msg_total_len
                existing.msg_short_count += row.msg_short_count
        return list(merged.values())

    @staticmethod
    def _merge_hour_rows(rows: Iterable[HourRepoDayDelta]) -> list[HourRepoDayDelta]:
        merged: dict[tuple[date, int, UUID, int], HourRepoDayDelta] = {}
        for row in rows:
            key = (row.day, row.project_id, row.repo_id, row.hour)
            existing = merged.get(key)
            if existing is None:
                merged[key] = HourRepoDayDelta(
                    day=row.day,
                    project_id=row.project_id,
                    repo_id=row.repo_id,
                    hour=row.hour,
                    commits=row.commits,
                    lines_added=row.lines_added,
                    lines_deleted=row.lines_deleted,
                )
            else:
                existing.commits += row.commits
                existing.lines_added += row.lines_added
                existing.lines_deleted += row.lines_deleted
        return list(merged.values())

    @staticmethod
    def _merge_size_rows(rows: Iterable[SizeBucketDelta]) -> list[SizeBucketDelta]:
        merged: dict[tuple[date, int, UUID, SizeBucket], SizeBucketDelta] = {}
        for row in rows:
            key = (row.day, row.project_id, row.repo_id, row.bucket)
            existing = merged.get(key)
            if existing is None:
                merged[key] = SizeBucketDelta(
                    day=row.day,
                    project_id=row.project_id,
                    repo_id=row.repo_id,
                    bucket=row.bucket,
                    cnt=row.cnt,
                )
            else:
                existing.cnt += row.cnt
        return list(merged.values())

    @staticmethod
    def _merge_file_rows(rows: Iterable[FileRepoDayDelta]) -> list[FileRepoDayDelta]:
        merged: dict[tuple[date, int, UUID, str], FileRepoDayDelta] = {}
        for row in rows:
            key = (row.day, row.project_id, row.repo_id, row.path)
            existing = merged.get(key)
            if existing is None:
                merged[key] = FileRepoDayDelta(
                    day=row.day,
                    project_id=row.project_id,
                    repo_id=row.repo_id,
                    path=row.path,
                    commits_touch=row.commits_touch,
                    lines_added=row.lines_added,
                    lines_deleted=row.lines_deleted,
                    churn=row.churn,
                )
            else:
                existing.commits_touch += row.commits_touch
                existing.lines_added += row.lines_added
                existing.lines_deleted += row.lines_deleted
                existing.churn += row.churn
        return list(merged.values())


    async def get_kpis(self, filters: AggregationFilter) -> KPIResult:
        if filters.repo_ids is not None and len(filters.repo_ids) == 0:
            return KPIResult(commits=0, active_devs=0, active_repos=0)

        stmt = sa.select(
            sa.func.coalesce(sa.func.sum(AggAuthorRepoDay.commits), 0),
            sa.func.count(sa.distinct(AggAuthorRepoDay.author_id)),
            sa.func.count(sa.distinct(AggAuthorRepoDay.repo_id)),
        )
        stmt = self._apply_author_filters(stmt, filters)
        result = await self.session.execute(stmt)
        commits, active_devs, active_repos = result.one()
        return KPIResult(
            commits=int(commits or 0),
            active_devs=int(active_devs or 0),
            active_repos=int(active_repos or 0),
        )

    async def get_daily_commit_series(self, filters: AggregationFilter) -> list[DailyCommitsPoint]:
        if filters.repo_ids is not None and len(filters.repo_ids) == 0:
            return []

        stmt = sa.select(
            AggAuthorRepoDay.day,
            sa.func.sum(AggAuthorRepoDay.commits).label("commits"),
        )
        stmt = self._apply_author_filters(stmt, filters)
        stmt = stmt.group_by(AggAuthorRepoDay.day).order_by(AggAuthorRepoDay.day)
        result = await self.session.execute(stmt)
        return [
            DailyCommitsPoint(day=row.day, commits=int(row.commits or 0))
            for row in result.fetchall()
        ]

    async def get_hourly_heatmap(self, filters: AggregationFilter) -> list[HourHeatmapPoint]:
        if filters.repo_ids is not None and len(filters.repo_ids) == 0:
            return []

        stmt = sa.select(
            AggHourRepoDay.hour,
            sa.func.sum(AggHourRepoDay.commits).label("commits"),
            sa.func.sum(AggHourRepoDay.lines_added).label("lines_added"),
            sa.func.sum(AggHourRepoDay.lines_deleted).label("lines_deleted"),
        )
        stmt = self._apply_common_filters(stmt, AggHourRepoDay, filters)
        stmt = stmt.group_by(AggHourRepoDay.hour).order_by(AggHourRepoDay.hour)
        result = await self.session.execute(stmt)
        return [
            HourHeatmapPoint(
                hour=int(row.hour),
                commits=int(row.commits or 0),
                lines_added=int(row.lines_added or 0),
                lines_deleted=int(row.lines_deleted or 0),
            )
            for row in result.fetchall()
        ]

    async def get_weekday_heatmap(self, filters: AggregationFilter) -> list[WeekdayHeatmapPoint]:
        if filters.repo_ids is not None and len(filters.repo_ids) == 0:
            return []

        weekday_expr = sa.cast(sa.func.extract("dow", AggHourRepoDay.day), sa.Integer)
        stmt = sa.select(
            weekday_expr.label("weekday"),
            sa.func.sum(AggHourRepoDay.commits).label("commits"),
        )
        stmt = self._apply_common_filters(stmt, AggHourRepoDay, filters)
        stmt = stmt.group_by(weekday_expr).order_by(weekday_expr)
        result = await self.session.execute(stmt)
        return [
            WeekdayHeatmapPoint(
                weekday=int(row.weekday),
                commits=int(row.commits or 0),
            )
            for row in result.fetchall()
        ]

    async def get_top_authors(
        self,
        filters: AggregationFilter,
        *,
        limit: int = 10,
    ) -> list[TopAuthorRow]:
        if filters.repo_ids is not None and len(filters.repo_ids) == 0:
            return []

        lines_expr = AggAuthorRepoDay.lines_added + AggAuthorRepoDay.lines_deleted
        stmt = sa.select(
            AggAuthorRepoDay.author_id,
            sa.func.sum(AggAuthorRepoDay.commits).label("commits"),
            sa.func.sum(lines_expr).label("lines"),
            Author.git_name,
            Author.git_email,
        ).join(Author, Author.id == AggAuthorRepoDay.author_id, isouter=True)
        stmt = self._apply_author_filters(stmt, filters)
        stmt = stmt.group_by(
            AggAuthorRepoDay.author_id,
            Author.git_name,
            Author.git_email,
        ).order_by(sa.desc("commits"), sa.desc("lines")).limit(limit)

        result = await self.session.execute(stmt)
        return [
            TopAuthorRow(
                author_id=row.author_id,
                commits=int(row.commits or 0),
                lines=int(row.lines or 0),
                git_name=row.git_name,
                git_email=row.git_email,
            )
            for row in result.fetchall()
        ]

    async def get_message_quality(self, filters: AggregationFilter) -> MessageQualityStats:
        if filters.repo_ids is not None and len(filters.repo_ids) == 0:
            return MessageQualityStats(avg_length=0.0, short_pct=0.0, total_commits=0)

        stmt = sa.select(
            sa.func.coalesce(sa.func.sum(AggAuthorRepoDay.msg_total_len), 0),
            sa.func.coalesce(sa.func.sum(AggAuthorRepoDay.msg_short_count), 0),
            sa.func.coalesce(sa.func.sum(AggAuthorRepoDay.commits), 0),
        )
        stmt = self._apply_author_filters(stmt, filters)
        result = await self.session.execute(stmt)
        total_len, short_count, total_commits = result.one()
        total_commits = int(total_commits or 0)
        avg_length = (total_len / total_commits) if total_commits else 0.0
        short_pct = (short_count / total_commits * 100) if total_commits else 0.0
        return MessageQualityStats(
            avg_length=float(avg_length),
            short_pct=float(short_pct),
            total_commits=total_commits,
        )

    async def get_size_histogram(self, filters: AggregationFilter) -> SizeHistogramStats:
        if filters.repo_ids is not None and len(filters.repo_ids) == 0:
            return SizeHistogramStats(histogram=[], approx_avg_churn=None, approx_median_churn=None)

        stmt = sa.select(
            AggSizeBucketRepoDay.bucket,
            sa.func.sum(AggSizeBucketRepoDay.cnt).label("count"),
        )
        stmt = self._apply_common_filters(stmt, AggSizeBucketRepoDay, filters)
        stmt = stmt.group_by(AggSizeBucketRepoDay.bucket)
        result = await self.session.execute(stmt)

        raw_rows = {row.bucket: int(row.count or 0) for row in result.fetchall()}  # pyright: ignore[reportArgumentType]
        histogram = [
            SizeHistogramBin(bucket=bucket, count=raw_rows.get(bucket, 0))
            for bucket in SizeBucket
        ]
        total = sum(bin.count for bin in histogram)
        if total == 0:
            return SizeHistogramStats(histogram=histogram, approx_avg_churn=None, approx_median_churn=None)

        avg = (
            sum(self._BUCKET_CENTERS[bin.bucket] * bin.count for bin in histogram) / total
            if total else None
        )

        cumulative = 0
        median_value: float | None = None
        threshold = (total + 1) / 2
        for bin in histogram:
            cumulative += bin.count
            if cumulative >= threshold:
                median_value = self._BUCKET_CENTERS[bin.bucket]
                break

        return SizeHistogramStats(
            histogram=histogram,
            approx_avg_churn=avg,
            approx_median_churn=median_value,
        )

    async def get_hot_files(
        self,
        filters: AggregationFilter,
        *,
        limit: int = 10,
    ) -> list[HotFileRow]:
        if filters.repo_ids is not None and len(filters.repo_ids) == 0:
            return []

        stmt = sa.select(
            AggFileRepoDay.path,
            sa.func.sum(AggFileRepoDay.commits_touch).label("commits_touch"),
            sa.func.sum(AggFileRepoDay.lines_added).label("lines_added"),
            sa.func.sum(AggFileRepoDay.lines_deleted).label("lines_deleted"),
            sa.func.sum(AggFileRepoDay.churn).label("churn"),
        )
        stmt = self._apply_common_filters(stmt, AggFileRepoDay, filters)
        stmt = stmt.group_by(AggFileRepoDay.path).order_by(sa.desc("churn"), sa.desc("commits_touch")).limit(limit)
        result = await self.session.execute(stmt)
        return [
            HotFileRow(
                path=row.path,
                commits_touch=int(row.commits_touch or 0),
                lines_added=int(row.lines_added or 0),
                lines_deleted=int(row.lines_deleted or 0),
                churn=int(row.churn or 0),
            )
            for row in result.fetchall()
        ]

    def _apply_author_filters(self, stmt: Select, filters: AggregationFilter) -> Select:
        stmt = self._apply_common_filters(stmt, AggAuthorRepoDay, filters)
        if filters.author_ids:
            stmt = stmt.where(AggAuthorRepoDay.author_id.in_(tuple(filters.author_ids)))
        return stmt

    def _apply_common_filters(self, stmt: Select, table: Any, filters: AggregationFilter) -> Select:
        if filters.since:
            stmt = stmt.where(table.day >= filters.since)
        if filters.until:
            stmt = stmt.where(table.day <= filters.until)
        if filters.project_id is not None:
            stmt = stmt.where(table.project_id == filters.project_id)
        if filters.repo_ids:
            stmt = stmt.where(table.repo_id.in_(tuple(filters.repo_ids)))
        return stmt
