export type TimelineRange = "1y" | "1m" | "7d"

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
