"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { useMetricsSummary } from "@/entities/metrics"
import {
  activityRangeOptions,
  CommitActivityChart,
  type ActivityRange,
  type DailyCommitsDatum,
} from "@/entities/commit-analytics"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  getMetricsRangeBounds,
} from "@/shared/lib/metrics-range"
import { cn } from "@/shared/lib/utils"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

const DEFAULT_RANGE: ActivityRange = activityRangeOptions[0]?.value ?? "1y"

const cardBaseClass =
  "h-full rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_60px_-28px_rgba(76,81,255,0.35)] backdrop-blur"

type CommitActivityWidgetProps = {
  projectId: number | null
  className?: string
}

export function CommitActivityWidget({
  projectId,
  className,
}: CommitActivityWidgetProps) {
  const isMobile = useIsMobile()
  const [range, setRange] = React.useState<ActivityRange>(DEFAULT_RANGE)

  React.useEffect(() => {
    if (isMobile && range !== "7d") {
      setRange("7d")
    }
  }, [isMobile, range])

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
  } = useMetricsSummary({
    since,
    until,
    projectId,
  })

  const activityData = React.useMemo<DailyCommitsDatum[]>(() => {
    if (!data) return []
    return data.series.daily.map((point) => ({
      date: point.date,
      commits: point.count,
    }))
  }, [data])

  const rangeLabel =
    activityRangeOptions.find((option) => option.value === range)?.label ?? ""

  if (isLoading && !data) {
    return <CommitActivitySkeleton className={className} />
  }

  if (isError) {
    return (
      <CommitActivityErrorState
        onRetry={refetch}
        className={className}
      />
    )
  }

  if (!activityData.length) {
    return <CommitActivityEmptyState className={className} />
  }

  return (
    <div className={className}>
      <CommitActivityChart
        data={activityData}
        range={range}
        rangeLabel={rangeLabel}
        onRangeChange={setRange}
        rangeOptions={activityRangeOptions}
      />
      {isFetching ? (
        <div className="mt-3 text-xs text-muted-foreground/70">
          Обновляем данные…
        </div>
      ) : null}
    </div>
  )
}

function CommitActivitySkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn(cardBaseClass, className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-semibold text-foreground">
          Total Commit Frequency
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground/80">
          Загружаем данные…
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 pt-4">
        <Skeleton className="h-[280px] w-full rounded-2xl bg-muted/30" />
      </CardContent>
    </Card>
  )
}

function CommitActivityEmptyState({ className }: { className?: string }) {
  return (
    <Card className={cn(cardBaseClass, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Total Commit Frequency
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground/80">
          Нет данных за выбранный период.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function CommitActivityErrorState({
  onRetry,
  className,
}: {
  onRetry: () => void
  className?: string
}) {
  return (
    <Card
      className={cn(
        cardBaseClass,
        "border-destructive/40 bg-destructive/10",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          Не удалось загрузить активность
        </CardTitle>
        <CardDescription className="text-sm text-destructive/80">
          Попробуйте обновить страницу или повторить попытку позже.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-5">
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/20"
        >
          Повторить попытку
        </Button>
      </CardContent>
    </Card>
  )
}
