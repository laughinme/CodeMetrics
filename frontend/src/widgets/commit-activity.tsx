"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  CommitActivityChart,
  commitTimeRangeOptions,
  getMockDailyCommits,
  type CommitTimeRange,
  type DailyCommitsDatum,
} from "@/entities/commit-analytics"

const DEFAULT_RANGE: CommitTimeRange = "30d"

export function CommitActivityWidget() {
  const isMobile = useIsMobile()
  const [range, setRange] =
    React.useState<CommitTimeRange>(DEFAULT_RANGE)

  React.useEffect(() => {
    if (isMobile) {
      setRange("7d")
    }
  }, [isMobile])

  const allCommits = React.useMemo(() => getMockDailyCommits(), [])

  const activityData = React.useMemo<DailyCommitsDatum[]>(() => {
    if (range === "all") {
      return allCommits
    }

    const days =
      range === "1d" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 30

    const lastPoint = allCommits[allCommits.length - 1]
    if (!lastPoint) {
      return []
    }

    const referenceDate = new Date(lastPoint.date)
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - (days - 1))

    return allCommits.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate
    })
  }, [allCommits, range])

  const rangeLabel =
    commitTimeRangeOptions.find((option) => option.value === range)?.label ?? ""

  return (
    <CommitActivityChart
      data={activityData}
      range={range}
      rangeLabel={rangeLabel}
      onRangeChange={setRange}
      rangeOptions={commitTimeRangeOptions}
    />
  )
}
