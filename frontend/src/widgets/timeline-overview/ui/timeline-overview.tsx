"use client"

import * as React from "react"

import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

import { useMetricsTimelineSummary } from "@/entities/metrics"
import {
  timelineRangeOptions,
  TimelineTrendChart,
  TimelineHourlyPatternChart,
  TimelineWeekdayPatternChart,
  type TimelineRange,
} from "@/entities/timeline"
import { SectionCards, type SectionCard } from "@/shared/components/section-cards"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { getMetricsRangeBounds } from "@/shared/lib/metrics-range"

type TimelineOverviewWidgetProps = {
  projectId: number | null
  className?: string
}

const DEFAULT_RANGE: TimelineRange =
  timelineRangeOptions[0]?.value ?? "1y"

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
})

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
})

const periodFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
})

export function TimelineOverviewWidget({
  projectId,
  className,
}: TimelineOverviewWidgetProps) {
  const [range, setRange] = React.useState<TimelineRange>(DEFAULT_RANGE)

  const { since, until } = React.useMemo(
    () => getMetricsRangeBounds(range),
    [range],
  )

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useMetricsTimelineSummary({
    since,
    until,
    projectId,
  })

  const periodLabel = React.useMemo(() => {
    const start = periodFormatter.format(since)
    const end = periodFormatter.format(until)
    return `${start} — ${end}`
  }, [since, until])

  const kpiCards = React.useMemo<SectionCard[]>(() => {
    if (!data) return []

    const { kpi, series } = data
    const peakDayLabel = kpi.peakDay
      ? periodFormatter.format(new Date(kpi.peakDay))
      : "—"
    const peakHourLabel =
      typeof kpi.peakHour === "number"
        ? `${String(kpi.peakHour).padStart(2, "0")}:00`
        : "—"
    const offhoursRaw = kpi.offhoursPct ?? 0
    const offhoursPct = offhoursRaw > 1 ? offhoursRaw : offhoursRaw * 100
    const activeDays = series.daily.filter((point) => point.count > 0).length

    return [
      {
        id: "timeline-commits",
        label: "Всего коммитов",
        value: numberFormatter.format(kpi.commits),
        secondary: `Период: ${periodLabel}`,
      },
      {
        id: "timeline-active-devs",
        label: "Активных разработчиков",
        value: numberFormatter.format(kpi.activeDevelopers),
      },
      {
        id: "timeline-active-repos",
        label: "Активных репозиториев",
        value: numberFormatter.format(kpi.activeRepositories),
      },
      {
        id: "timeline-active-days",
        label: "Дней с коммитами",
        value: numberFormatter.format(activeDays),
      },
      {
        id: "timeline-peak-day",
        label: "Пиковый день",
        value: peakDayLabel,
      },
      {
        id: "timeline-peak-hour",
        label: "Пиковый час",
        value: peakHourLabel,
        secondary: `Off-hours: ${percentFormatter.format(offhoursPct)}%`,
      },
    ]
  }, [data, periodLabel])

  const dailyData = React.useMemo(() => {
    if (!data) return []
    const map = new Map(data.series.daily.map((point) => [point.date, point.count]))
    const result: { date: string; count: number }[] = []
    const cursor = new Date(since)
    const end = new Date(until)

    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10)
      result.push({
        date: iso,
        count: map.get(iso) ?? 0,
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    return result
  }, [data, since, until])

  const hourlyData = React.useMemo(() => {
    if (!data) return []
    return data.series.byHour.map((point) => ({
      hour: point.hour,
      count: point.commits,
    }))
  }, [data])

  const weekdayData = React.useMemo(() => {
    if (!data) return []
    return data.series.byWeekday.map((point) => {
      const reference = new Date(Date.UTC(2024, 0, 1 + point.weekday))
      return {
        weekday: weekdayFormatter.format(reference),
        count: point.commits,
      }
    })
  }, [data])

  if (isLoading && !data) {
    return <TimelineOverviewSkeleton className={className} />
  }

  if (isError) {
    return (
      <TimelineOverviewErrorState
        className={className}
        onRetry={refetch}
      />
    )
  }

  if (!data || dailyData.length === 0) {
    return <TimelineOverviewEmptyState className={className} />
  }

  return (
    <div className={className}>
      <SectionCards cards={kpiCards} />
      <div className="mt-6 flex flex-col gap-6">
        <TimelineTrendChart
          data={dailyData}
          range={range}
          rangeOptions={timelineRangeOptions}
          onRangeChange={setRange}
        />
        {isFetching ? (
          <div className="px-2 text-xs text-muted-foreground/70 lg:px-0">
            Обновляем данные…
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-2">
          <TimelineHourlyPatternChart data={hourlyData} />
          <TimelineWeekdayPatternChart data={weekdayData} />
        </div>
      </div>
    </div>
  )
}

function TimelineOverviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <DashboardSkeletonCards />
      <div className="mt-6 flex flex-col gap-6">
        <Card className="rounded-3xl border-border/30 bg-card/80 p-6 shadow-[0_10px_60px_-28px_rgba(76,81,255,0.35)] backdrop-blur">
          <Skeleton className="h-[320px] w-full rounded-2xl bg-muted/30" />
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-3xl border-border/30 bg-card/80 p-6 shadow-[0_10px_50px_-28px_rgba(64,217,108,0.25)] backdrop-blur"
            >
              <Skeleton className="h-[260px] w-full rounded-2xl bg-muted/30" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelineOverviewErrorState({
  onRetry,
  className,
}: {
  onRetry: () => void
  className?: string
}) {
  return (
    <Card
      className="rounded-3xl border-destructive/40 bg-destructive/10 px-6 py-5 text-sm text-destructive shadow-[0_20px_60px_-40px_rgba(220,38,38,0.35)] backdrop-blur"
      data-slot="timeline-error"
    >
      <CardHeader className="flex flex-col gap-3 p-0 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          Не удалось загрузить таймлайн
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/15"
        >
          Повторить попытку
        </Button>
      </CardHeader>
    </Card>
  )
}

function TimelineOverviewEmptyState({ className }: { className?: string }) {
  return (
    <Card className="rounded-3xl border-dashed border-border/40 bg-card/60 px-6 py-5 text-sm text-muted-foreground backdrop-blur">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-semibold text-foreground">
          Недостаточно данных для построения таймлайна
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground/80">
          Попробуйте выбрать другой проект или период.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function DashboardSkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 lg:px-6 @lg/main:grid-cols-2 @2xl/main:grid-cols-3 @4xl/main:grid-cols-4 @5xl/main:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card
          key={index}
          className="rounded-3xl border-border/30 bg-card/80 p-5 shadow-[0_10px_40px_-24px_rgba(112,118,255,0.45)] backdrop-blur"
        >
          <div className="flex h-full flex-col gap-4">
            <Skeleton className="h-4 w-32 rounded-full bg-muted/40" />
            <Skeleton className="h-8 w-2/3 rounded-lg bg-muted/30" />
            <Skeleton className="h-4 w-24 rounded-full bg-muted/30" />
          </div>
        </Card>
      ))}
    </div>
  )
}
