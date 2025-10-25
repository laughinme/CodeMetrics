export type DeveloperProfileMetric = {
  id: string
  label: string
  value: string
  secondary?: string
}

export type DeveloperDailyActivityDatum = {
  date: string
  commits: number
}

export type DeveloperHourlyPatternDatum = {
  hour: number
  count: number
}

export type DeveloperWeekdayPatternDatum = {
  day: string
  label: string
  count: number
}

export type DeveloperCommitItem = {
  sha: string
  message: string
  repo: string
  author: string
  additions: number
  deletions: number
  committedAt: string
}

export type DeveloperProfile = {
  id: string
  name: string
  email: string
  summary: DeveloperProfileMetric[]
  dailyActivity: DeveloperDailyActivityDatum[]
  hourlyPattern: DeveloperHourlyPatternDatum[]
  weekdayPattern: DeveloperWeekdayPatternDatum[]
  commits: DeveloperCommitItem[]
}
