import type {
  MetricsSummaryDto,
  MetricsTimelineSummaryDto,
} from "@/shared/api/metrics"

import type {
  MetricsKpi,
  MetricsSeries,
  MetricsSummary,
  MetricsTimelineSummary,
  TimelineKpi,
  TopAuthor,
  LatestCommit,
  Recommendation,
} from "./types"

const toMetricsKpi = (dto: MetricsSummaryDto["kpi"]): MetricsKpi => ({
  commits: dto.commits,
  activeDevelopers: dto.active_devs,
  activeRepositories: dto.active_repos,
  avgCommitSize: {
    mean: dto.avg_commit_size.mean,
    median: dto.avg_commit_size.median,
  },
  messageQuality: {
    avgLength: dto.msg_quality.avg_length,
    shortPercentage: dto.msg_quality.short_pct,
  },
})

const toSeries = (dto: MetricsSummaryDto["series"]): MetricsSeries => ({
  daily: dto.commits_daily.map((item) => ({
    date: item.date,
    count: item.count,
  })),
  byHour: dto.by_hour.map((item) => ({
    hour: item.hour,
    commits: item.commits,
    sharePct: item.share_pct,
    linesAdded: item.lines_added,
    linesDeleted: item.lines_deleted,
  })),
  byWeekday: dto.by_weekday.map((item) => ({
    weekday: item.weekday,
    commits: item.commits,
    sharePct: item.share_pct,
  })),
  sizeHistogram: dto.size_hist.map((item) => ({
    bucket: item.bucket,
    count: item.count,
  })),
})

const toTopAuthor = (
  dto: MetricsSummaryDto["authors_top"][number],
): TopAuthor => ({
  id: dto.author_id,
  name: dto.git_name,
  email: dto.git_email,
  commits: dto.commits,
  lines: dto.lines,
  sharePct: dto.share_pct,
})

const toLatestCommit = (
  dto: MetricsSummaryDto["latest_commits"][number],
): LatestCommit => ({
  sha: dto.sha,
  repo: {
    id: dto.repo.id,
    name: dto.repo.name,
    projectId: dto.repo.project_id,
  },
  author: {
    id: dto.author.id,
    name: dto.author.name,
    email: dto.author.email,
  },
  committer: {
    id: dto.committer.id,
    name: dto.committer.name,
    email: dto.committer.email,
  },
  committedAt: dto.committed_at,
  message: dto.message,
  isMerge: dto.is_merge,
  addedLines: dto.added_lines,
  deletedLines: dto.deleted_lines,
  filesChanged: dto.files_changed,
})

const toRecommendation = (
  dto: MetricsSummaryDto["recommendations"][number],
): Recommendation => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  severity: dto.severity,
})

export const toMetricsSummary = (dto: MetricsSummaryDto): MetricsSummary => ({
  kpi: toMetricsKpi(dto.kpi),
  series: toSeries(dto.series),
  topAuthors: dto.authors_top.map(toTopAuthor),
  latestCommits: dto.latest_commits.map(toLatestCommit),
  recommendations: dto.recommendations.map(toRecommendation),
})

export const toTimelineKpi = (
  dto: MetricsTimelineSummaryDto["kpi"],
): TimelineKpi => ({
  commits: dto.commits,
  activeDevelopers: dto.active_devs,
  activeRepositories: dto.active_repos,
  avgCommitSize: {
    mean: dto.avg_commit_size.mean,
    median: dto.avg_commit_size.median,
  },
  messageQuality: {
    avgLength: dto.msg_quality.avg_length,
    shortPercentage: dto.msg_quality.short_pct,
  },
  peakDay: dto.peak_day,
  peakHour: dto.peak_hour,
  offhoursPct: dto.offhours_pct,
})

export const toTimelineSeries = (
  dto: MetricsTimelineSummaryDto["series"],
): MetricsSeries => toSeries(dto)

export const toMetricsTimelineSummary = (
  dto: MetricsTimelineSummaryDto,
): MetricsTimelineSummary => ({
  kpi: toTimelineKpi(dto.kpi),
  series: toTimelineSeries(dto.series),
})
