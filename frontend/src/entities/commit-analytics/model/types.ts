export type CommitTimeRange = "1d" | "7d" | "30d" | "all"

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
