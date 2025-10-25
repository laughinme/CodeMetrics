"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  CommitTopAuthorsChart,
  commitTimeRangeOptions,
  getMockTopAuthors,
  type CommitTimeRange,
} from "@/entities/commit-analytics"

const TOP_AUTHOR_RANGE_OPTIONS = commitTimeRangeOptions.filter(
  (option) => option.value !== "7d"
)
const DEFAULT_RANGE: CommitTimeRange =
  TOP_AUTHOR_RANGE_OPTIONS[0]?.value ?? "30d"

export function CommitTopAuthorsWidget() {
  const isMobile = useIsMobile()
  const [range, setRange] = React.useState<CommitTimeRange>(DEFAULT_RANGE)

  React.useEffect(() => {
    if (isMobile) {
      const mobileRange =
        TOP_AUTHOR_RANGE_OPTIONS[TOP_AUTHOR_RANGE_OPTIONS.length - 1]?.value ??
        DEFAULT_RANGE
      setRange(mobileRange)
    }
  }, [isMobile])

  const authorsData = React.useMemo(() => {
    return getMockTopAuthors(range).sort((a, b) => b.commits - a.commits)
  }, [range])

  const rangeLabel =
    TOP_AUTHOR_RANGE_OPTIONS.find((option) => option.value === range)?.label ?? ""

  return (
    <CommitTopAuthorsChart
      data={authorsData}
      range={range}
      rangeLabel={rangeLabel}
      onRangeChange={setRange}
      rangeOptions={TOP_AUTHOR_RANGE_OPTIONS}
    />
  )
}
