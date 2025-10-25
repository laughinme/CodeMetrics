import { useMemo, useState } from "react"

import { timelineRangeOptions, type TimelineRange } from "@/entities/timeline"
import { getMetricsRangeBounds } from "@/shared/lib/metrics-range"

export type TimelineFiltersState = {
  since: Date
  until: Date
  projectId: number | null
}

type UseTimelineFiltersOptions = {
  initialRange?: TimelineRange
}

const DEFAULT_RANGE: TimelineRange =
  timelineRangeOptions[0]?.value ?? "1y"

export function useTimelineFilters(
  options: UseTimelineFiltersOptions = {},
) {
  const { initialRange } = options
  const [range, setRange] = useState<TimelineRange>(
    initialRange ?? DEFAULT_RANGE,
  )
  const [projectId, setProjectId] = useState<number | null>(null)

  const bounds = useMemo(() => getMetricsRangeBounds(range), [range])

  const filters = useMemo<TimelineFiltersState>(
    () => ({
      since: bounds.since,
      until: bounds.until,
      projectId,
    }),
    [bounds, projectId],
  )

  return {
    range,
    setRange,
    projectId,
    setProjectId,
    since: bounds.since,
    until: bounds.until,
    rangeOptions: timelineRangeOptions,
    filters,
  }
}
