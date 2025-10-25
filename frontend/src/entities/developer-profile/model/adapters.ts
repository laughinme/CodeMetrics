import type {
  DeveloperCommitsDto,
  DeveloperCommitDto,
  DeveloperProfileSummaryDto,
} from "@/shared/api/developerProfile"

import type {
  DeveloperCommitFeed,
  DeveloperCommitItem,
  DeveloperDailyActivityDatum,
  DeveloperProfileSummary,
  DeveloperRecommendation,
  DeveloperSizeHistogramBucket,
  DeveloperWeekdayPatternDatum,
  DeveloperHourlyPatternDatum,
} from "./types"

const WEEKDAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const

const toDailyActivity = (
  point: DeveloperProfileSummaryDto["series"]["commits_daily"][number],
): DeveloperDailyActivityDatum => ({
  date: point.date,
  commits: point.count,
})

const toHourlyPattern = (
  point: DeveloperProfileSummaryDto["series"]["by_hour"][number],
): DeveloperHourlyPatternDatum => ({
  hour: point.hour,
  commits: point.commits,
  sharePct: point.share_pct,
  linesAdded: point.lines_added,
  linesDeleted: point.lines_deleted,
})

const toWeekdayPattern = (
  point: DeveloperProfileSummaryDto["series"]["by_weekday"][number],
): DeveloperWeekdayPatternDatum => ({
  weekday: point.weekday,
  label: WEEKDAY_LABELS[point.weekday] ?? String(point.weekday),
  commits: point.commits,
  sharePct: point.share_pct,
})

const toSizeBucket = (
  bucket: DeveloperProfileSummaryDto["series"]["size_hist"][number],
): DeveloperSizeHistogramBucket => ({
  bucket: bucket.bucket,
  count: bucket.count,
})

const toRecommendation = (
  recommendation: DeveloperProfileSummaryDto["recommendations"][number],
): DeveloperRecommendation => ({
  id: recommendation.id,
  title: recommendation.title,
  description: recommendation.description,
  severity: recommendation.severity ?? "info",
})

const toCommitItem = (commit: DeveloperCommitDto): DeveloperCommitItem => ({
  sha: commit.sha,
  repoId: commit.repo.id,
  repoName: commit.repo.name,
  projectId: Number.isFinite(commit.repo.project_id)
    ? commit.repo.project_id
    : null,
  authorId: commit.author.id,
  authorName: commit.author.name,
  authorEmail: commit.author.email,
  committerId: commit.committer.id,
  committerName: commit.committer.name,
  committerEmail: commit.committer.email,
  committedAt: commit.committed_at,
  message: commit.message,
  isMerge: commit.is_merge,
  addedLines: commit.added_lines,
  deletedLines: commit.deleted_lines,
  filesChanged: commit.files_changed,
})

const toCommitFeed = (dto: {
  items: DeveloperCommitDto[]
  next_cursor: string | null
}): DeveloperCommitFeed => ({
  items: dto.items.map(toCommitItem),
  nextCursor: dto.next_cursor ?? null,
})

export const toDeveloperProfileSummary = (
  dto: DeveloperProfileSummaryDto,
): DeveloperProfileSummary => ({
  kpi: {
    commitsCount: dto.kpi.commits,
    activeDevelopers: dto.kpi.active_devs,
    activeRepositories: dto.kpi.active_repos,
    avgCommitSize: {
      mean: dto.kpi.avg_commit_size.mean,
      median: dto.kpi.avg_commit_size.median,
    },
    messageQuality: {
      avgLength: dto.kpi.msg_quality.avg_length,
      shortPercentage: dto.kpi.msg_quality.short_pct,
    },
  },
  daily: dto.series.commits_daily.map(toDailyActivity),
  hourly: dto.series.by_hour.map(toHourlyPattern),
  weekday: dto.series.by_weekday.map(toWeekdayPattern),
  sizeHistogram: (dto.series.size_hist ?? dto.size_hist ?? []).map(
    toSizeBucket,
  ),
  latestCommits: toCommitFeed(dto.latest_commits),
  recommendations: dto.recommendations.map(toRecommendation),
})

export const toDeveloperCommitsFeed = (
  dto: DeveloperCommitsDto,
): DeveloperCommitFeed => toCommitFeed(dto)
