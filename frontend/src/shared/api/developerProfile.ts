import apiProtected from "./axiosInstance"

type DateLike = string | Date

export type DeveloperIdentityDto = {
  id: string
  name: string
  email: string
}

export type DeveloperRepoDto = {
  id: string
  project_id: number
  name: string
}

export type DeveloperCommitDto = {
  sha: string
  repo: DeveloperRepoDto
  author: DeveloperIdentityDto
  committer: DeveloperIdentityDto
  committed_at: string
  message: string
  is_merge: boolean
  added_lines: number
  deleted_lines: number
  files_changed: number
}

export type DeveloperProfileSummaryDto = {
  kpi: {
    commits: number
    active_devs: number
    active_repos: number
    avg_commit_size: { mean: number; median: number }
    msg_quality: { avg_length: number; short_pct: number }
  }
  series: {
    commits_daily: Array<{ date: string; count: number }>
    by_hour: Array<{
      hour: number
      commits: number
      share_pct: number
      lines_added: number
      lines_deleted: number
    }>
    by_weekday: Array<{ weekday: number; commits: number; share_pct: number }>
    size_hist: Array<{ bucket: string; count: number }>
  }
  size_hist?: Array<{ bucket: string; count: number }>
  latest_commits: {
    items: DeveloperCommitDto[]
    next_cursor: string | null
  }
  recommendations: Array<{
    id: string
    title: string
    description: string
    severity: "info" | "warning" | "success" | "critical" | string
  }>
}

export type DeveloperProfileSummaryParams = {
  authorId: string
  since: DateLike
  until: DateLike
  projectId?: number | null
  repoIds?: string[] | null
  limit?: number
  cursor?: string | null
}

export type DeveloperCommitsParams = {
  authorId: string
  since: DateLike
  until: DateLike
  projectId?: number | null
  repoIds?: string[] | null
  limit?: number
  cursor?: string | null
}

export type DeveloperCommitsDto = {
  items: DeveloperCommitDto[]
  next_cursor: string | null
}

const toDateOnly = (value: DateLike) =>
  typeof value === "string" ? value : value.toISOString().slice(0, 10)

const stripNil = <T extends Record<string, unknown>>(input: T): T =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null),
  ) as T

export async function getDeveloperProfileSummary({
  authorId,
  since,
  until,
  projectId,
  repoIds,
  limit,
  cursor,
}: DeveloperProfileSummaryParams) {
  const params = stripNil({
    since: toDateOnly(since),
    until: toDateOnly(until),
    project_id: projectId ?? null,
    repoIds: repoIds && repoIds.length ? repoIds : null,
    limit,
    cursor: cursor ?? null,
  })

  const { data } = await apiProtected.get<DeveloperProfileSummaryDto>(
    `/developers/${authorId}/summary`,
    { params },
  )

  return data
}

export async function getDeveloperCommits({
  authorId,
  since,
  until,
  projectId,
  repoIds,
  limit,
  cursor,
}: DeveloperCommitsParams) {
  const params = stripNil({
    since: toDateOnly(since),
    until: toDateOnly(until),
    project_id: projectId ?? null,
    repoIds: repoIds && repoIds.length ? repoIds : null,
    limit,
    cursor: cursor ?? null,
  })

  const { data } = await apiProtected.get<DeveloperCommitsDto>(
    `/developers/${authorId}/commits`,
    { params },
  )

  return data
}
