"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  activityRangeOptions,
  CommitActivityChart,
  getMockDailyCommits,
  type ActivityRange,
  type DailyCommitsDatum,
} from "@/entities/commit-analytics"

const DEFAULT_RANGE: ActivityRange = activityRangeOptions[0]?.value ?? "90d"

export function CommitActivityWidget() {
  const isMobile = useIsMobile()
  const [range, setRange] = React.useState<ActivityRange>(DEFAULT_RANGE)

  React.useEffect(() => {
    if (isMobile) {
      setRange("7d")
    }
  }, [isMobile])

  const allCommits = React.useMemo(() => getMockDailyCommits(), [])

  const activityData = React.useMemo<DailyCommitsDatum[]>(() => {
    const days = range === "90d" ? 90 : range === "30d" ? 30 : 7
    return allCommits.slice(Math.max(allCommits.length - days, 0))
  }, [allCommits, range])

  const rangeLabel =
    activityRangeOptions.find((option) => option.value === range)?.label ?? ""

  return (
    <CommitActivityChart
      data={activityData}
      range={range}
      rangeLabel={rangeLabel}
      onRangeChange={setRange}
      rangeOptions={activityRangeOptions}
    />
  )
}
