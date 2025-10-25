import type { CSSProperties } from "react"
import { useMemo } from "react"

import { AppSidebar } from "@/shared/components/app-sidebar"
import { SectionCards } from "@/shared/components/section-cards"
import { SiteHeader } from "@/shared/components/site-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { DeveloperListWidget } from "@/widgets/developer-list"
import { DevSummaryFiltersWidget } from "@/widgets/dev-summary-filters"
import { useDevSummaryFilters } from "@/features/dev-summary-filters"
import { useDevelopersSummary } from "@/entities/developer"

const numberFormatter = new Intl.NumberFormat("ru-RU")
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
})

export default function DevelopersPage() {
  const {
    filters,
    range,
    setRange,
    rangeOptions,
    projectId,
    setProjectId,
  } = useDevSummaryFilters()

  const {
    data: summary,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDevelopersSummary(filters)

  const cards = useMemo(() => {
    if (!summary) {
      return []
    }

    const {
      commitsCount,
      activeDevelopers,
      activeRepositories,
      avgCommitSize,
      messageQuality,
    } = summary.kpi

    return [
      {
        id: "commits-total",
        label: "Всего коммитов",
        value: numberFormatter.format(commitsCount),
      },
      {
        id: "developers-active",
        label: "Активных разработчиков",
        value: numberFormatter.format(activeDevelopers),
      },
      {
        id: "active-repos",
        label: "Активных репо",
        value: numberFormatter.format(activeRepositories),
      },
      {
        id: "commit-avg-size",
        label: "Средний размер коммита",
        value: numberFormatter.format(Math.round(avgCommitSize.mean)),
        secondary: `Медиана: ${numberFormatter.format(
          Math.round(avgCommitSize.median),
        )}`,
      },
      {
        id: "short-messages",
        label: "Short Msg %",
        value: `${percentFormatter.format(messageQuality.shortPercentage)}%`,
        secondary: `Avg length: ${numberFormatter.format(
          Math.round(messageQuality.avgLength),
        )}`,
      },
    ]
  }, [summary])

  const authors = summary?.authors ?? []
  const isInitialLoading = !summary && isLoading
  const isRefreshing = Boolean(summary) && isFetching

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title="Developers"
          description="Фильтры применяются ко всем виджетам на странице"
          filters={
            <DevSummaryFiltersWidget
              range={range}
              onRangeChange={setRange}
              rangeOptions={rangeOptions}
              projectId={projectId}
              onProjectChange={setProjectId}
            />
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-6 py-6">
              {isInitialLoading ? (
                <SectionCardsSkeleton />
              ) : cards.length ? (
                <SectionCards cards={cards} />
              ) : null}
              <div className="px-4 lg:px-6">
                {error ? (
                  <ErrorStateCard onRetry={refetch} />
                ) : isInitialLoading ? (
                  <DeveloperTableSkeleton />
                ) : authors.length ? (
                  <DeveloperListWidget data={authors} />
                ) : (
                  <EmptyStateCard message="Нет данных за выбранный период." />
                )}
                {isRefreshing ? (
                  <div className="mt-3 text-xs text-muted-foreground/70">
                    Обновляем данные…
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 lg:px-6 @lg/main:grid-cols-2 @2xl/main:grid-cols-3 @4xl/main:grid-cols-4 @5xl/main:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card
          key={index}
          className="rounded-3xl border-border/30 bg-card/70 p-5 shadow-[0_10px_40px_-24px_rgba(112,118,255,0.35)]"
        >
          <Skeleton className="h-3 w-24 rounded-full bg-muted/40" />
          <Skeleton className="mt-6 h-10 w-32 rounded-md bg-muted/30" />
        </Card>
      ))}
    </div>
  )
}

function DeveloperTableSkeleton() {
  return (
    <Card className="rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_50px_-26px_rgba(76,81,255,0.25)] backdrop-blur">
      <CardHeader className="border-border/10 border-b pb-4">
        <CardTitle className="text-base font-semibold text-foreground/75">
          Обзор производительности разработчиков
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-6">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-9 w-full rounded-full bg-muted/20"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyStateCard({ message }: { message: string }) {
  return (
    <Card className="rounded-3xl border-dashed border-border/40 bg-card/60 p-6 text-center text-sm text-muted-foreground">
      {message}
    </Card>
  )
}

function ErrorStateCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="flex flex-col gap-3 rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
      <span className="font-semibold">Не удалось загрузить данные.</span>
      <span className="text-xs text-destructive/80">
        Проверьте соединение или попробуйте обновить фильтры.
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="ml-auto border-destructive/40 text-destructive hover:bg-destructive/10"
        onClick={() => onRetry()}
      >
        Повторить
      </Button>
    </Card>
  )
}
