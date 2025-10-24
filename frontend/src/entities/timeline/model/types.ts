export type TimelineRange = "90d" | "30d" | "7d"

export type TimelineRangeOption = {
  value: TimelineRange
  label: string
}

export type TimelineDailyDatum = {
  date: string
  count: number
}

export type TimelineHourlyDatum = {
  hour: number
  count: number
}

export type TimelineWeekdayDatum = {
  weekday: string
  count: number
}
