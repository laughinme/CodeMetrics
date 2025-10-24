"use client"

import { useMemo, useState } from "react"

import {
  getTimelineDailyData,
  getTimelineHourlyPattern,
  getTimelineWeekdayPattern,
  timelineFilters,
  timelineKpiCards,
  timelineRangeOptions,
  TimelineTrendChart,
  TimelineHourlyPatternChart,
  TimelineWeekdayPatternChart,
  type TimelineRange,
} from "@/entities/timeline"
import { SectionCards } from "@/shared/components/section-cards"

type TimelineOverviewWidgetProps = {
  className?: string
}

const DEFAULT_RANGE: TimelineRange = timelineRangeOptions[0]?.value ?? "90d"

export function TimelineOverviewWidget({ className }: TimelineOverviewWidgetProps) {
  const [range, setRange] = useState<TimelineRange>(DEFAULT_RANGE)

  const dailyData = useMemo(() => getTimelineDailyData(range), [range])
  const hourlyData = useMemo(() => getTimelineHourlyPattern(), [])
  const weekdayData = useMemo(() => getTimelineWeekdayPattern(), [])

  return (
    <div className={className}>
      <SectionCards cards={timelineKpiCards} />
      <div className="mt-6 flex flex-col gap-6">
        <TimelineTrendChart
          data={dailyData}
          range={range}
          rangeOptions={timelineRangeOptions}
          onRangeChange={setRange}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <TimelineHourlyPatternChart data={hourlyData} />
          <TimelineWeekdayPatternChart data={weekdayData} />
        </div>
      </div>
    </div>
  )
}

export const timelineOverviewFilters = timelineFilters
