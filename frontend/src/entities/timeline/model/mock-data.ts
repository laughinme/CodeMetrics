import type { SectionCard } from "@/shared/components/section-cards"

import type {
  TimelineDailyDatum,
  TimelineHourlyDatum,
  TimelineRange,
  TimelineRangeOption,
  TimelineWeekdayDatum,
} from "./types"

const BASE_RANGE_OPTIONS: TimelineRangeOption[] = [
  { value: "1y", label: "1 year" },
  { value: "1m", label: "1 month" },
  { value: "7d", label: "7 days" },
]

const TOTAL_DAYS = 400

const referenceEndDate = new Date("2024-10-24T00:00:00Z")

const dailyTimelineBase: TimelineDailyDatum[] = Array.from(
  { length: TOTAL_DAYS },
  (_, index) => {
    const date = new Date(referenceEndDate)
    date.setUTCDate(referenceEndDate.getUTCDate() - (TOTAL_DAYS - 1 - index))

    const dayFactor = Math.sin(index / 8) * 2.5 + Math.cos(index / 5) * 1.5
    const weeklyModifier = [0.6, 0.8, 1, 1.1, 1.2, 0.9, 0.7][date.getUTCDay()]
    const base = 6 + (index % 11) * 0.4

    return {
      date: date.toISOString().slice(0, 10),
      count: Math.max(2, Math.round((base + dayFactor) * weeklyModifier)),
    }
  },
)

const hourlyPatternBase: TimelineHourlyDatum[] = Array.from(
  { length: 24 },
  (_, hour) => {
    const base = [0.6, 0.4, 0.3, 0.3, 0.4, 0.5][hour % 6] + hour * 0.03
    const peakBoost =
      hour >= 9 && hour <= 18 ? 2.6 - Math.abs(14 - hour) * 0.22 : 0.8

    return {
      hour,
      count: Math.max(1, Math.round(base + peakBoost)),
    }
  },
)

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

const weekdayPatternBase: TimelineWeekdayDatum[] = weekdayLabels.map(
  (weekday, index) => {
    const modifiers = [0.95, 1.3, 1.25, 1, 1.15, 0.7, 0.85]
    const base = 9

    return {
      weekday,
      count: Math.max(4, Math.round(base * modifiers[index])),
    }
  },
)

const rangeDays: Record<TimelineRange, number> = {
  "1y": 365,
  "1m": 31,
  "7d": 7,
}

export function getTimelineDailyData(range: TimelineRange): TimelineDailyDatum[] {
  const days = rangeDays[range] ?? dailyTimelineBase.length
  return dailyTimelineBase.slice(-days)
}

export function getTimelineHourlyPattern(): TimelineHourlyDatum[] {
  return [...hourlyPatternBase]
}

export function getTimelineWeekdayPattern(): TimelineWeekdayDatum[] {
  return [...weekdayPatternBase]
}

export const timelineRangeOptions = BASE_RANGE_OPTIONS

export const timelineKpiCards: SectionCard[] = [
  { id: "total-commits", label: "Всего коммитов", value: "191" },
  { id: "active-developers", label: "Активных разработчиков", value: "9" },
  { id: "active-days", label: "Дней активности", value: "30" },
  { id: "peak-weekday", label: "Пиковый день", value: "Вт" },
  { id: "peak-hour", label: "Пиковый час", value: "19:00" },
]

export const timelineFilters = {
  scope: {
    label: "All projects",
  },
  period: {
    label: "1 month",
  },
} satisfies Record<
  "scope" | "period",
  {
    label: string
  }
>
