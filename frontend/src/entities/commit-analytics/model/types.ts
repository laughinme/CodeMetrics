export type CommitTimeRange = "1y" | "1m" | "7d"

export type TimeRangeOption = {
  value: CommitTimeRange
  label: string
}

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
