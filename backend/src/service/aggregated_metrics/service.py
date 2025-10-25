from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, date, datetime, time
from typing import Sequence
from uuid import UUID

from database.relational_db import (
    AggregateMetricsInterface,
    AggregationFilter,
    CommitInterface,
    HotFileRow,
    KPIResult,
    MessageQualityStats,
    SizeBucket,
    SizeHistogramStats,
    UoW,
)
from domain.metrics import (
    CommitFeed,
    CommitSeriesPoint,
    CommitSummary,
    CommitSizeStats,
    DashboardSeries,
    DashboardSummary,
    DeveloperDetailSummary,
    DevelopersSummary,
    AuthorActivityRow,
    HourHeatmapPointOut,
    InsightRecommendation,
    KPIBlock,
    MessageQualityBlock,
    PersonRef,
    RepoRefSummary,
    SizeBucketPoint,
    TimelineKPI,
    TimelineSummary,
    TopAuthorRowOut,
    WeekdayHeatmapPointOut,
)
from database.relational_db.tables.commits.commits_table import Commit


@dataclass(slots=True)
class _FilterParams:
    since: date
    until: date
    project_id: int | None
    repo_ids: Sequence[UUID] | None
    author_ids: Sequence[UUID] | None


class AggregatedMetricsService:
    WORKING_HOURS = set(range(9, 19))

    def __init__(
        self,
        uow: UoW,
        aggregates: AggregateMetricsInterface,
        commits: CommitInterface,
    ) -> None:
        self._uow = uow
        self._aggregates = aggregates
        self._commits = commits

    async def get_dashboard_summary(
        self,
        *,
        params: _FilterParams,
        latest_limit: int = 10,
    ) -> DashboardSummary:
        agg_filter = self._build_filter(params)

        kpi = await self._aggregates.get_kpis(agg_filter)
        message_quality = await self._aggregates.get_message_quality(agg_filter)
        size_stats = await self._aggregates.get_size_histogram(agg_filter)
        daily_points = await self._aggregates.get_daily_commit_series(agg_filter)
        hour_points = await self._aggregates.get_hourly_heatmap(agg_filter)
        weekday_points = await self._aggregates.get_weekday_heatmap(agg_filter)
        top_authors = await self._aggregates.get_top_authors(agg_filter, limit=10)
        hot_files = await self._aggregates.get_hot_files(agg_filter, limit=3)

        series = DashboardSeries(
            commits_daily=[CommitSeriesPoint(date=p.day, count=p.commits) for p in daily_points],
            by_hour=self._build_hour_series(hour_points),
            by_weekday=self._build_weekday_series(weekday_points),
            size_hist=[SizeBucketPoint(bucket=bin.bucket.value, count=bin.count) for bin in size_stats.histogram],
        )

        total_commits = kpi.commits
        denominator = total_commits if total_commits > 0 else 1
        authors_top = [
            TopAuthorRowOut(
                author_id=row.author_id,
                commits=row.commits,
                lines=row.lines,
                share_pct=round(row.commits / denominator * 100, 2) if total_commits else 0.0,
                git_name=row.git_name,
                git_email=row.git_email,
            )
            for row in top_authors
        ]

        latest_feed = (
            await self._get_latest_commits(params, limit=latest_limit)
            if latest_limit > 0
            else CommitFeed(items=[], next_cursor=None)
        )

        recommendations = self._build_recommendations(
            kpi=kpi,
            size_stats=size_stats,
            hour_points=series.by_hour,
            authors=authors_top,
            hot_files=hot_files,
        )

        return DashboardSummary(
            kpi=self._build_kpi_block(kpi, message_quality, size_stats),
            series=series,
            authors_top=authors_top,
            latest_commits=latest_feed.items,
            recommendations=recommendations,
        )

    async def get_timeline_summary(self, *, params: _FilterParams) -> TimelineSummary:
        dashboard = await self.get_dashboard_summary(params=params, latest_limit=0)

        peak_day = (
            max(dashboard.series.commits_daily, key=lambda point: point.count).date
            if dashboard.series.commits_daily
            else None
        )
        peak_hour = (
            max(dashboard.series.by_hour, key=lambda point: point.commits).hour
            if dashboard.series.by_hour
            else None
        )
        offhours_pct = self._compute_offhours_pct(dashboard.series.by_hour)

        kpi = dashboard.kpi
        timeline_kpi = TimelineKPI(
            commits=kpi.commits,
            active_devs=kpi.active_devs,
            active_repos=kpi.active_repos,
            avg_commit_size=kpi.avg_commit_size,
            msg_quality=kpi.msg_quality,
            peak_day=peak_day,
            peak_hour=peak_hour,
            offhours_pct=offhours_pct,
        )

        return TimelineSummary(
            kpi=timeline_kpi,
            series=dashboard.series,
        )

    async def get_developers_summary(self, *, params: _FilterParams) -> DevelopersSummary:
        agg_filter = self._build_filter(params)
        kpi = await self._aggregates.get_kpis(agg_filter)
        message_quality = await self._aggregates.get_message_quality(agg_filter)
        size_stats = await self._aggregates.get_size_histogram(agg_filter)
        top_authors = await self._aggregates.get_top_authors(agg_filter, limit=50)

        total_commits = kpi.commits
        denominator = total_commits if total_commits > 0 else 1
        top_rows = [
            TopAuthorRowOut(
                author_id=row.author_id,
                commits=row.commits,
                lines=row.lines,
                share_pct=round(row.commits / denominator * 100, 2) if total_commits else 0.0,
                git_name=row.git_name,
                git_email=row.git_email,
            )
            for row in top_authors
        ]

        authors = [
            AuthorActivityRow(
                author_id=row.author_id,
                commits=row.commits,
                lines=row.lines,
                share_pct=row.share_pct,
                git_name=row.git_name,
                git_email=row.git_email,
            )
            for row in top_rows
        ]

        return DevelopersSummary(
            kpi=self._build_kpi_block(kpi, message_quality, size_stats),
            authors=authors,
        )

    async def get_developer_detail(
        self,
        *,
        author_id: UUID,
        params: _FilterParams,
        limit: int = 20,
        cursor: str | None = None,
    ) -> DeveloperDetailSummary:
        author_params = _FilterParams(
            since=params.since,
            until=params.until,
            project_id=params.project_id,
            repo_ids=params.repo_ids,
            author_ids=[author_id],
        )
        agg_filter = self._build_filter(author_params)

        kpi = await self._aggregates.get_kpis(agg_filter)
        message_quality = await self._aggregates.get_message_quality(agg_filter)
        size_stats = await self._aggregates.get_size_histogram(agg_filter)
        daily_points = await self._aggregates.get_daily_commit_series(agg_filter)
        hour_points = await self._aggregates.get_hourly_heatmap(agg_filter)
        weekday_points = await self._aggregates.get_weekday_heatmap(agg_filter)

        series = DashboardSeries(
            commits_daily=[CommitSeriesPoint(date=p.day, count=p.commits) for p in daily_points],
            by_hour=self._build_hour_series(hour_points),
            by_weekday=self._build_weekday_series(weekday_points),
            size_hist=[SizeBucketPoint(bucket=bin.bucket.value, count=bin.count) for bin in size_stats.histogram],
        )

        decoded_cursor = self._decode_cursor(cursor) if cursor else None
        commits_feed = await self._get_latest_commits(author_params, limit=limit, cursor=decoded_cursor)

        recommendations = self._build_recommendations(
            kpi=kpi,
            size_stats=size_stats,
            hour_points=series.by_hour,
            authors=[
                TopAuthorRowOut(
                    author_id=author_id,
                    commits=kpi.commits,
                    lines=0,
                    share_pct=100.0 if kpi.commits else 0.0,
                )
            ],
            hot_files=[],
            scope="individual",
        )

        return DeveloperDetailSummary(
            kpi=self._build_kpi_block(kpi, message_quality, size_stats),
            series=series,
            size_hist=[SizeBucketPoint(bucket=bin.bucket.value, count=bin.count) for bin in size_stats.histogram],
            latest_commits=commits_feed,
            recommendations=recommendations,
        )

    async def get_developer_commits(
        self,
        *,
        author_id: UUID,
        params: _FilterParams,
        limit: int = 20,
        cursor: str | None = None,
    ) -> CommitFeed:
        author_params = _FilterParams(
            since=params.since,
            until=params.until,
            project_id=params.project_id,
            repo_ids=params.repo_ids,
            author_ids=[author_id],
        )
        decoded_cursor = self._decode_cursor(cursor) if cursor else None
        return await self._get_latest_commits(author_params, limit=limit, cursor=decoded_cursor)

    async def get_insights(self, *, params: _FilterParams) -> list[InsightRecommendation]:
        summary = await self.get_dashboard_summary(params=params, latest_limit=0)
        return summary.recommendations

    @staticmethod
    def create_params(
        *,
        since: date,
        until: date,
        project_id: int | None = None,
        repo_ids: Sequence[UUID] | None = None,
        author_ids: Sequence[UUID] | None = None,
    ) -> _FilterParams:
        repo_seq = tuple(repo_ids) if repo_ids else None
        author_seq = tuple(author_ids) if author_ids else None
        return _FilterParams(
            since=since,
            until=until,
            project_id=project_id,
            repo_ids=repo_seq,
            author_ids=author_seq,
        )

    def _build_filter(self, params: _FilterParams) -> AggregationFilter:
        if params.since and params.until and params.since > params.until:
            raise ValueError("since must be before until")

        repo_ids = tuple(params.repo_ids) if params.repo_ids else None
        author_ids = tuple(params.author_ids) if params.author_ids else None

        return AggregationFilter(
            since=params.since,
            until=params.until,
            project_id=params.project_id,
            repo_ids=repo_ids,
            author_ids=author_ids,
        )

    async def _get_latest_commits(
        self,
        params: _FilterParams,
        *,
        limit: int,
        cursor: tuple[datetime, str] | None = None,
    ) -> CommitFeed:
        since_dt = datetime.combine(params.since, time.min, tzinfo=UTC) if params.since else None
        until_dt = datetime.combine(params.until, time.max, tzinfo=UTC) if params.until else None

        commits, next_cursor = await self._commits.list_recent_filtered(
            limit=limit,
            since=since_dt,
            until=until_dt,
            project_id=params.project_id,
            repo_ids=params.repo_ids,
            author_ids=params.author_ids,
            cursor=cursor,
        )

        items = [self._convert_commit(commit) for commit in commits]
        encoded_cursor = self._encode_cursor(next_cursor) if next_cursor else None

        return CommitFeed(items=items, next_cursor=encoded_cursor)

    def _convert_commit(self, commit: Commit) -> CommitSummary:
        repo = commit.repository
        author = commit.author
        committer = commit.committer

        committed_at = commit.committed_at or commit.created_at

        return CommitSummary(
            sha=commit.sha,
            repo=RepoRefSummary(
                id=repo.id,
                project_id=repo.project_id,
                name=repo.name,
            ),
            author=self._to_person(author, commit.author_name, commit.author_email),
            committer=self._to_person(committer, commit.committer_name, commit.committer_email),
            committed_at=committed_at,
            message=commit.message,
            is_merge=commit.is_merge_commit,
            added_lines=commit.added_lines,
            deleted_lines=commit.deleted_lines,
            files_changed=len(commit.files),
        )

    def _to_person(self, entity, fallback_name: str | None, fallback_email: str | None) -> PersonRef:
        if entity is None:
            return PersonRef(name=fallback_name, email=fallback_email)

        return PersonRef(
            id=entity.id,
            name=entity.git_name or fallback_name,
            email=entity.git_email or fallback_email,
        )

    def _build_kpi_block(
        self,
        kpi: KPIResult,
        message_quality: MessageQualityStats,
        size_stats: SizeHistogramStats,
    ) -> KPIBlock:
        return KPIBlock(
            commits=kpi.commits,
            active_devs=kpi.active_devs,
            active_repos=kpi.active_repos,
            avg_commit_size=CommitSizeStats(
                mean=size_stats.approx_avg_churn,
                median=size_stats.approx_median_churn,
            ),
            msg_quality=MessageQualityBlock(
                avg_length=round(message_quality.avg_length, 2),
                short_pct=round(message_quality.short_pct, 2),
            ),
        )

    def _build_hour_series(self, hour_points) -> list[HourHeatmapPointOut]:
        total = sum(point.commits for point in hour_points)
        return [
            HourHeatmapPointOut(
                hour=point.hour,
                commits=point.commits,
                share_pct=round(point.commits / total * 100, 2) if total else 0.0,
                lines_added=point.lines_added,
                lines_deleted=point.lines_deleted,
            )
            for point in hour_points
        ]

    def _build_weekday_series(self, weekday_points) -> list[WeekdayHeatmapPointOut]:
        total = sum(point.commits for point in weekday_points)
        return [
            WeekdayHeatmapPointOut(
                weekday=point.weekday,
                commits=point.commits,
                share_pct=round(point.commits / total * 100, 2) if total else 0.0,
            )
            for point in weekday_points
        ]

    def _compute_offhours_pct(self, hour_points: Sequence[HourHeatmapPointOut]) -> float:
        total = sum(point.commits for point in hour_points)
        if total == 0:
            return 0.0

        working = sum(point.commits for point in hour_points if point.hour in self.WORKING_HOURS)
        offhours = total - working
        return round(offhours / total * 100, 2)

    def _build_recommendations(
        self,
        *,
        kpi: KPIResult,
        size_stats: SizeHistogramStats,
        hour_points: Sequence[HourHeatmapPointOut],
        authors: Sequence[TopAuthorRowOut],
        hot_files: Sequence[HotFileRow],
        scope: str = "team",
    ) -> list[InsightRecommendation]:
        recommendations: list[InsightRecommendation] = []

        total_commits = kpi.commits

        if scope != "individual" and total_commits >= 5:
            large_bucket = next(
                (bin for bin in size_stats.histogram if bin.bucket == SizeBucket.HUNDRED_PLUS),
                None,
            )
            if large_bucket:
                share_raw = large_bucket.count / total_commits
                share = min(share_raw, 1.0)
                if share >= 0.2:
                    recommendations.append(
                        InsightRecommendation(
                            id="large-commits",
                            title="Слишком крупные коммиты",
                            description=f"{round(share * 100, 1)}% коммитов попадает в бакет 100+. Попробуйте дробить изменения.",
                            severity="warning",
                        )
                    )

        total_hour_commits = sum(point.commits for point in hour_points)
        offhours_pct = self._compute_offhours_pct(hour_points)
        if total_hour_commits >= 10 and offhours_pct >= 40.0:
            recommendations.append(
                InsightRecommendation(
                    id="off-hours",
                    title="Высокая активность вне рабочего времени",
                    description=f"{offhours_pct}% коммитов выполняется в нерабочие часы. Проверьте распределение нагрузки.",
                    severity="warning" if scope == "team" else "info",
                )
            )

        if scope != "individual" and len(authors) >= 2:
            top_share = authors[0].share_pct
            if top_share >= 50.0:
                recommendations.append(
                    InsightRecommendation(
                        id="author-concentration",
                        title="Коммиты сконцентрированы у одного разработчика",
                        description=f"Топ-автор делает {round(top_share, 1)}% коммитов. Подумайте над перераспределением задач.",
                        severity="info",
                    )
                )

        if hot_files:
            hottest = hot_files[0]
            recommendations.append(
                InsightRecommendation(
                    id="hot-file",
                    title="Файл с высоким churn",
                    description=f'Файл "{hottest.path}" менялся {hottest.commits_touch} раз и набрал churn {hottest.churn}. Рассмотрите рефакторинг.',
                    severity="info",
                )
            )

        return recommendations

    def _encode_cursor(self, cursor: tuple[datetime, str]) -> str:
        timestamp, sha = cursor
        return f"{timestamp.isoformat()}|{sha}"

    def _decode_cursor(self, cursor: str) -> tuple[datetime, str]:
        timestamp_str, sha = cursor.split("|", 1)
        timestamp = datetime.fromisoformat(timestamp_str)
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=UTC)
        return timestamp, sha
