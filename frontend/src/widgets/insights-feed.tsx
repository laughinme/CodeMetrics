"use client"

import {
  ExclamationTriangleIcon,
  UpdateIcon,
} from "@radix-ui/react-icons"
import type { InsightsParams } from "@/shared/api/insights"
import { useInsights, InsightList } from "@/entities/insight"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"

type InsightsFeedWidgetProps = {
  params: InsightsParams
  className?: string
}

export function InsightsFeedWidget({
  params,
  className,
}: InsightsFeedWidgetProps) {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useInsights(params)

  if (isLoading && !data) {
    return <InsightsFeedSkeleton className={className} />
  }

  if (isError) {
    return <InsightsErrorState onRetry={refetch} className={className} />
  }

  const insights = data ?? []

  if (!insights.length) {
    return (
      <InsightsEmptyState
        message="Советы пока не найдены для выбранных параметров."
        className={className}
      />
    )
  }

  return (
    <div className={className}>
      <InsightList items={insights} />
      {isFetching ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/70">
          <UpdateIcon className="size-3 animate-spin" />
          Обновляем рекомендации…
        </div>
      ) : null}
    </div>
  )
}

function InsightsFeedSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-3xl border-border/30 bg-card/70 p-6 shadow-[0_32px_90px_-70px_rgba(124,132,255,0.35)] backdrop-blur"
          >
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-32 rounded-full bg-muted/40" />
              <Skeleton className="h-5 w-3/4 rounded-md bg-muted/30" />
              <Skeleton className="h-4 w-full rounded-md bg-muted/20" />
              <Skeleton className="h-4 w-2/3 rounded-md bg-muted/20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function InsightsEmptyState({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div className={className}>
      <Card className="rounded-3xl border-dashed border-border/40 bg-card/60 p-6 text-center text-sm text-muted-foreground">
        {message}
      </Card>
    </div>
  )
}

function InsightsErrorState({
  onRetry,
  className,
}: {
  onRetry: () => void
  className?: string
}) {
  return (
    <div className={className}>
      <Card className="flex flex-col gap-3 rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        <div className="flex items-center gap-2 font-medium">
          <ExclamationTriangleIcon className="size-4" />
          Не удалось загрузить советы
        </div>
        <p className="text-destructive/80">
          Попробуйте повторить попытку чуть позже.
        </p>
        <div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={onRetry}
          >
            Повторить попытку
          </Button>
        </div>
      </Card>
    </div>
  )
}
