import { useMemo, useState } from "react"

import type {
  DevSummaryFilters,
  DevSummaryRange,
  DevSummaryRangeOption,
} from "./types"

const RANGE_MAP: Record<DevSummaryRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
}

const RANGE_OPTIONS: DevSummaryRangeOption[] = [
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" },
  { value: "1y", label: "1 год" },
]

const getDateRange = (range: DevSummaryRange) => {
  const until = new Date()
  const since = new Date(until)
  const days = RANGE_MAP[range] ?? RANGE_MAP["1y"]
  since.setDate(until.getDate() - (days - 1))
  return { since, until }
}

export function useDevSummaryFilters(initialRange: DevSummaryRange = "1y") {
  const [range, setRange] = useState<DevSummaryRange>(initialRange)
  const [projectId, setProjectId] = useState<number | null>(null)

  const filters = useMemo<DevSummaryFilters>(() => {
    const { since, until } = getDateRange(range)
    return {
      since,
      until,
      project_id: projectId ?? null,
    }
  }, [range, projectId])

  const rangeOptions = RANGE_OPTIONS

  return {
    filters,
    range,
    projectId,
    setRange,
    setProjectId,
    rangeOptions,
  }
}
