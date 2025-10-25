export type MetricAverages = {
  mean: number
  median: number
}

export type MessageQuality = {
  avgLength: number
  shortPercentage: number
}

export type MetricsKpi = {
  commits: number
  activeDevelopers: number
  activeRepositories: number
  avgCommitSize: MetricAverages
  messageQuality: MessageQuality
}

export type TopAuthor = {
  id: string
  name: string
  email: string
  commits: number
  lines: number
  sharePct: number
}

export type LatestCommit = {
  sha: string
  repo: {
    id: string
    name: string
    projectId: number
  }
  author: {
    id: string
    name: string
    email: string
  }
  committer: {
    id: string
    name: string
    email: string
  }
  committedAt: string
  message: string
  isMerge: boolean
  addedLines: number
  deletedLines: number
  filesChanged: number
}

export type RecommendationSeverity = "info" | "warning" | "critical"

export type Recommendation = {
  id: string
  title: string
  description: string
  severity: RecommendationSeverity
}

export type DailyCommitPoint = {
  date: string
  count: number
}

export type HourlyCommitPoint = {
  hour: number
  commits: number
  sharePct: number
  linesAdded: number
  linesDeleted: number
}

export type WeekdayCommitPoint = {
  weekday: number
  commits: number
  sharePct: number
}

export type SizeHistogramBucket = {
  bucket: string
  count: number
}

export type MetricsSeries = {
  daily: DailyCommitPoint[]
  byHour: HourlyCommitPoint[]
  byWeekday: WeekdayCommitPoint[]
  sizeHistogram: SizeHistogramBucket[]
}

export type MetricsSummary = {
  kpi: MetricsKpi
  series: MetricsSeries
  topAuthors: TopAuthor[]
  latestCommits: LatestCommit[]
  recommendations: Recommendation[]
}

export type TimelineKpi = MetricsKpi & {
  peakDay: string | null
  peakHour: number | null
  offhoursPct: number | null
}

export type MetricsTimelineSummary = {
  kpi: TimelineKpi
  series: MetricsSeries
}

export type MetricsSummaryFilters = {
  since: Date | string
  until: Date | string
  projectId?: number | null
  repoIds?: string[] | null
  authorIds?: string[] | null
  latestLimit?: number
}

export type MetricsTimelineFilters = {
  since: Date | string
  until: Date | string
  projectId?: number | null
  repoIds?: string[] | null
  authorIds?: string[] | null
}
