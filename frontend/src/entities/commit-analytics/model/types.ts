import type { MetricsRangeOption, MetricsRangeValue } from "@/shared/lib/metrics-range"

export type CommitTimeRange = MetricsRangeValue

export type TimeRangeOption = MetricsRangeOption

export type AuthorDatum = {
  author: string
  commits: number
}

export type DailyCommitsDatum = {
  date: string
  commits: number
}

export type ContributionActivityDatum = {
  date: string
  commits: number
}
