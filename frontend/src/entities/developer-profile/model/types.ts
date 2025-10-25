import type { DevKpi } from "@/entities/developer"

export type DeveloperDailyActivityDatum = {
  date: string
  commits: number
}

export type DeveloperHourlyPatternDatum = {
  hour: number
  commits: number
  linesAdded: number
  linesDeleted: number
}

export type DeveloperWeekdayPatternDatum = {
  weekday: number
  label: string
  commits: number
}

export type DeveloperSizeHistogramBucket = {
  bucket: string
  count: number
}

export type DeveloperRecommendation = {
  id: string
  title: string
  description: string
  severity: "info" | "warning" | "success" | "critical" | string
}

export type DeveloperCommitItem = {
  sha: string
  repoId: string
  repoName: string
  projectId: number | null
  authorId: string
  authorName: string
  authorEmail: string
  committerId: string
  committerName: string
  committerEmail: string
  committedAt: string
  message: string
  isMerge: boolean
  addedLines: number
  deletedLines: number
  filesChanged: number
}

export type DeveloperCommitFeed = {
  items: DeveloperCommitItem[]
  nextCursor: string | null
}

export type DeveloperProfileSummary = {
  kpi: DevKpi
  daily: DeveloperDailyActivityDatum[]
  hourly: DeveloperHourlyPatternDatum[]
  weekday: DeveloperWeekdayPatternDatum[]
  sizeHistogram: DeveloperSizeHistogramBucket[]
  latestCommits: DeveloperCommitFeed
  recommendations: DeveloperRecommendation[]
}
