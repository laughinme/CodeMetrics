"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  CommitTopAuthorsChart,
  commitTimeRangeOptions,
  getMockTopAuthors,
  type CommitTimeRange,
} from "@/entities/commit-analytics"

const DEFAULT_RANGE: CommitTimeRange = "30d"

export function CommitTopAuthorsWidget() {
  const isMobile = useIsMobile()
  const [range, setRange] =
    React.useState<CommitTimeRange>(DEFAULT_RANGE)

  React.useEffect(() => {
    if (isMobile) {
      setRange("7d")
    }
  }, [isMobile])

  const authorsData = React.useMemo(() => {
    return getMockTopAuthors(range).sort((a, b) => b.commits - a.commits)
  }, [range])

  const rangeLabel =
    commitTimeRangeOptions.find((option) => option.value === range)?.label ?? ""

  return (
    <CommitTopAuthorsChart
      data={authorsData}
      range={range}
      rangeLabel={rangeLabel}
      onRangeChange={setRange}
      rangeOptions={commitTimeRangeOptions}
    />
  )
}
