export type MetricsRangeValue = "1y" | "1m" | "7d"

export type MetricsRangeOption = {
  value: MetricsRangeValue
  label: string
}

const RANGE_TO_DAYS: Record<MetricsRangeValue, number> = {
  "1y": 365,
  "1m": 30,
  "7d": 7,
}

export const metricsRangeOptions: MetricsRangeOption[] = [
  { value: "1y", label: "1 year" },
  { value: "1m", label: "1 month" },
  { value: "7d", label: "7 days" },
]

export const getMetricsRangeBounds = (
  range: MetricsRangeValue,
  referenceDate: Date = new Date(),
) => {
  const until = new Date(referenceDate)
  until.setHours(0, 0, 0, 0)

  const days = RANGE_TO_DAYS[range] ?? RANGE_TO_DAYS["1m"]
  const since = new Date(until)
  since.setDate(until.getDate() - (days - 1))

  return { since, until }
}
