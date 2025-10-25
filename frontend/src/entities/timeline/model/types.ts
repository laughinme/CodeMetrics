import type { MetricsRangeOption, MetricsRangeValue } from "@/shared/lib/metrics-range"

export type TimelineRange = MetricsRangeValue

export type TimelineRangeOption = MetricsRangeOption

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
