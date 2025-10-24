"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  CommitHourlyHeatmapChart,
  commitTimeRangeOptions,
  getMockContributionActivity,
  type CommitTimeRange,
  type ContributionActivityDatum,
} from "@/entities/commit-analytics"

const DEFAULT_RANGE: CommitTimeRange = "30d"

export function CommitHourlyHeatmapWidget() {
  const isMobile = useIsMobile()
  const [range, setRange] =
    React.useState<CommitTimeRange>(DEFAULT_RANGE)

  React.useEffect(() => {
    if (isMobile) {
      setRange("7d")
    }
  }, [isMobile])

  const data = React.useMemo<ContributionActivityDatum[]>(() => {
    return getMockContributionActivity(range)
  }, [range])

  const rangeLabel =
    commitTimeRangeOptions.find((option) => option.value === range)?.label ?? ""

  return (
    <CommitHourlyHeatmapChart
      data={data}
      range={range}
      rangeLabel={rangeLabel}
      onRangeChange={setRange}
      rangeOptions={commitTimeRangeOptions}
    />
  )
}
