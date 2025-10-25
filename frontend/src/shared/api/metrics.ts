import apiProtected from "./axiosInstance"

type AvgCommitSizeDto = {
  mean: number
  median: number
}

type MsgQualityDto = {
  avg_length: number
  short_pct: number
}

type AuthorSummaryDto = {
  author_id: string
  commits: number
  lines: number
  share_pct: number
  git_name: string
  git_email: string
}

type RepoInfoDto = {
  id: string
  project_id: number
  name: string
}

type CommitPersonDto = {
  id: string
  name: string
  email: string
}

type LatestCommitDto = {
  sha: string
  repo: RepoInfoDto
  author: CommitPersonDto
  committer: CommitPersonDto
  committed_at: string
  message: string
  is_merge: boolean
  added_lines: number
  deleted_lines: number
  files_changed: number
}

type RecommendationDto = {
  id: string
  title: string
  description: string
  severity: "info" | "warning" | "critical"
}

type DailyCommitPointDto = {
  date: string
  count: number
}

type HourlyCommitPointDto = {
  hour: number
  commits: number
  share_pct: number
  lines_added: number
  lines_deleted: number
}

type WeekdayCommitPointDto = {
  weekday: number
  commits: number
  share_pct: number
}

type SizeHistogramBucketDto = {
  bucket: string
  count: number
}

export type MetricsSummaryDto = {
  kpi: {
    commits: number
    active_devs: number
    active_repos: number
    avg_commit_size: AvgCommitSizeDto
    msg_quality: MsgQualityDto
  }
  series: {
    commits_daily: DailyCommitPointDto[]
    by_hour: HourlyCommitPointDto[]
    by_weekday: WeekdayCommitPointDto[]
    size_hist: SizeHistogramBucketDto[]
  }
  authors_top: AuthorSummaryDto[]
  latest_commits: LatestCommitDto[]
  recommendations: RecommendationDto[]
}

export type MetricsTimelineSummaryDto = {
  kpi: MetricsSummaryDto["kpi"] & {
    peak_day: string | null
    peak_hour: number | null
    offhours_pct: number | null
  }
  series: MetricsSummaryDto["series"]
}

export type MetricsSummaryParams = {
  since: string | Date
  until: string | Date
  projectId?: number | null
  repoIds?: string[] | null
  authorIds?: string[] | null
  latestLimit?: number
}

export type MetricsTimelineParams = {
  since: string | Date
  until: string | Date
  projectId?: number | null
  repoIds?: string[] | null
  authorIds?: string[] | null
}

const toDateOnly = (value: string | Date) =>
  typeof value === "string" ? value : value.toISOString().slice(0, 10)

const normalizeArray = (values?: string[] | null) =>
  values && values.length ? values : undefined

const stripNil = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as T

export async function getMetricsSummary(params: MetricsSummaryParams) {
  const cleaned = stripNil({
    since: toDateOnly(params.since),
    until: toDateOnly(params.until),
    project_id:
      typeof params.projectId === "number" ? params.projectId : undefined,
    repo_ids: normalizeArray(params.repoIds ?? undefined),
    author_ids: normalizeArray(params.authorIds ?? undefined),
    latest_limit: typeof params.latestLimit === "number" ? params.latestLimit : undefined,
  })

  const { data } = await apiProtected.get<MetricsSummaryDto>(
    "/metrics/summary",
    { params: cleaned },
  )
  return data
}

export async function getMetricsTimelineSummary(
  params: MetricsTimelineParams,
) {
  const cleaned = stripNil({
    since: toDateOnly(params.since),
    until: toDateOnly(params.until),
    project_id:
      typeof params.projectId === "number" ? params.projectId : undefined,
    repo_ids: normalizeArray(params.repoIds ?? undefined),
    author_ids: normalizeArray(params.authorIds ?? undefined),
  })

  const { data } = await apiProtected.get<MetricsTimelineSummaryDto>(
    "/metrics/timeline/summary",
    { params: cleaned },
  )
  return data
}
