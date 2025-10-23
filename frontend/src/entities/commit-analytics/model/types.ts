export type CommitTimeRange = "1d" | "7d" | "30d" | "all"

export type TimeRangeOption = {
  value: CommitTimeRange
  label: string
}

export type CommitDayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type AuthorDatum = {
  author: string
  commits: number
}

export type DailyCommitsDatum = {
  date: string
  commits: number
}

export type HourlyActivityDatum = {
  day: CommitDayKey
  hour: number
  commits: number
}
