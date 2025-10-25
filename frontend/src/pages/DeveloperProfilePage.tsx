import type { CSSProperties } from "react"
import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { ArrowLeft, Lightbulb, Mail } from "lucide-react"

import {
  DeveloperActivityChart,
  DeveloperCommitsTable,
  DeveloperHourlyPatternChart,
  DeveloperWeekdayPatternChart,
  useDeveloperCommits,
  useDeveloperProfileSummary,
} from "@/entities/developer-profile"
import { useDevSummaryFilters } from "@/features/dev-summary-filters"
import { DevSummaryFiltersWidget } from "@/widgets/dev-summary-filters"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { SectionCards } from "@/shared/components/section-cards"
import { SiteHeader } from "@/shared/components/site-header"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"

import type { DeveloperRecommendation } from "@/entities/developer-profile/model/types"

const layoutStyle = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 14 * 1.1)",
} as CSSProperties

const numberFormatter = new Intl.NumberFormat("ru-RU")
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
})

const toDateKey = (value: Date | string) =>
  typeof value === "string" ? value : value.toISOString().slice(0, 10)

export default function DeveloperProfilePage() {
  const { developerId } = useParams<{ developerId: string }>()
  const location = useLocation()
  const locationState = location.state as
    | { name?: string; email?: string }
    | undefined

  const {
    filters,
    range,
    setRange,
    rangeOptions,
    projectId,
    setProjectId,
  } = useDevSummaryFilters()

  const [commitsCursor, setCommitsCursor] = useState<string | null>(null)
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([])

  const summaryQuery = useDeveloperProfileSummary({
    authorId: developerId,
    since: filters.since,
    until: filters.until,
    project_id: filters.project_id,
    repoIds: filters.repoIds ?? null,
    latestCommitsLimit: 10,
  })

  const commitsFilterSignature = useMemo(
    () =>
      JSON.stringify({
        developerId,
        since: toDateKey(filters.since),
        until: toDateKey(filters.until),
        projectId: filters.project_id ?? null,
        repoIds:
          filters.repoIds && filters.repoIds.length
            ? [...filters.repoIds].sort()
            : [],
      }),
    [
      developerId,
      filters.project_id,
      filters.repoIds,
      filters.since,
      filters.until,
    ],
  )

  useEffect(() => {
    setCommitsCursor(null)
    setCursorHistory([])
  }, [commitsFilterSignature])

  const commitsQuery = useDeveloperCommits({
    authorId: developerId,
    since: filters.since,
    until: filters.until,
    project_id: filters.project_id,
    repoIds: filters.repoIds ?? null,
    limit: 10,
    cursor: commitsCursor,
  })

  const summary = summaryQuery.data
  const dailyActivity = useMemo(
    () =>
      summary
        ? [...summary.daily].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
        : [],
    [summary],
  )

  const recommendations = summary?.recommendations ?? []

  const commitsFeed = commitsQuery.data
  const commits = commitsFeed?.items ?? []
  const hasNextCommitPage = Boolean(commitsFeed?.nextCursor)
  const hasPreviousCommitPage = cursorHistory.length > 0
  const currentCommitPage = cursorHistory.length + 1
  const isCommitsFetching = commitsQuery.isFetching && !commitsQuery.isLoading

  const latestCommit = summary?.latestCommits.items[0] ?? null
  const developerName =
    locationState?.name ??
    latestCommit?.authorName ??
    (developerId ? `#${developerId.slice(0, 5)}` : "")
  const developerEmail =
    locationState?.email ?? latestCommit?.authorEmail ?? null

  const pageTitle = developerName
    ? `Профиль разработчика ${developerName}`
    : "Профиль разработчика"

  const summaryCards = useMemo(() => {
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

    const shortPct =
      messageQuality.shortPercentage <= 1
        ? messageQuality.shortPercentage * 100
        : messageQuality.shortPercentage

    return [
      {
        id: "commits-total",
        label: "Коммитов за период",
        value: numberFormatter.format(commitsCount),
      },
      {
        id: "active-repos",
        label: "Активных репозиториев",
        value: numberFormatter.format(activeRepositories),
      },
      {
        id: "active-devs",
        label: "Участники коммитов",
        value: numberFormatter.format(activeDevelopers),
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
        value: `${percentFormatter.format(shortPct)}%`,
        secondary: `Avg length: ${numberFormatter.format(
          Math.round(messageQuality.avgLength),
        )}`,
      },
    ]
  }, [summary])

  const isSummaryInitialLoading = summaryQuery.isLoading && !summary
  const isSummaryRefreshing = Boolean(summary) && summaryQuery.isFetching
  const summaryError = summaryQuery.error

  const isCommitsInitialLoading = commitsQuery.isLoading && commits.length === 0
  const commitsError = commitsQuery.error

  const handleNextCommitPage = () => {
    if (!hasNextCommitPage || isCommitsFetching) {
      return
    }
    setCursorHistory((prev) => [...prev, commitsCursor])
    setCommitsCursor(commitsFeed?.nextCursor ?? null)
  }

  const handlePreviousCommitPage = () => {
    if (isCommitsFetching) {
      return
    }
    setCursorHistory((prev) => {
      if (!prev.length) {
        setCommitsCursor(null)
        return prev
      }
      const newHistory = [...prev]
      const previousCursor = newHistory.pop() ?? null
      setCommitsCursor(previousCursor)
      return newHistory
    })
  }

  if (!developerId) {
    return (
      <SidebarProvider style={layoutStyle}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Профиль разработчика" />
          <div className="flex flex-1 items-center justify-center px-4">
            <Card className="max-w-lg rounded-3xl border-dashed border-border/40 bg-card/60 p-8 text-center text-sm text-muted-foreground">
              Разработчик не найден. Вернитесь к списку разработчиков.
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider style={layoutStyle}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title={pageTitle}
          description={developerEmail ?? undefined}
          filters={
            <DevSummaryFiltersWidget
              range={range}
              onRangeChange={setRange}
              rangeOptions={rangeOptions}
              projectId={projectId}
              onProjectChange={setProjectId}
            />
          }
          actions={
            <Link
              to="/developers"
              className="flex h-10 items-center gap-2 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              Назад
            </Link>
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-6 py-6">
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                {developerEmail ? (
                  <Badge
                    variant="outline"
                    className="flex w-fit items-center gap-2 rounded-full border-border/40 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/90"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {developerEmail}
                  </Badge>
                ) : null}
                {isSummaryRefreshing ? (
                  <span className="text-xs text-muted-foreground/70">
                    Обновляем данные…
                  </span>
                ) : null}
              </div>

              {summaryError ? (
                <div className="px-4 lg:px-6">
                  <ErrorStateCard
                    message="Не удалось загрузить метрики разработчика."
                    onRetry={() => summaryQuery.refetch()}
                  />
                </div>
              ) : (
                <>
                  {isSummaryInitialLoading ? (
                    <SectionCardsSkeleton />
                  ) : summaryCards.length ? (
                    <SectionCards cards={summaryCards} />
                  ) : null}

                  <div className="flex flex-col gap-8 px-4 lg:px-6">
                    {isSummaryInitialLoading ? (
                      <ChartsSkeleton />
                    ) : summary ? (
                      <>
                        <DeveloperActivityChart data={dailyActivity} />
                        <div className="grid gap-6 lg:grid-cols-2">
                          <DeveloperHourlyPatternChart
                            data={summary.hourly}
                          />
                          <DeveloperWeekdayPatternChart
                            data={summary.weekday}
                          />
                        </div>
                        {recommendations.length ? (
                          <RecommendationsCard
                            recommendations={recommendations}
                          />
                        ) : null}
                      </>
                    ) : (
                      <EmptyStateCard message="Нет данных за выбранный период." />
                    )}

                    <div className="flex flex-col gap-4">
                      {commitsError ? (
                        <ErrorStateCard
                          message="Не удалось загрузить коммиты разработчика."
                          onRetry={() => commitsQuery.refetch()}
                        />
                      ) : isCommitsInitialLoading ? (
                        <DeveloperTableSkeleton />
                      ) : commits.length ? (
                        <DeveloperCommitsTable
                          commits={commits}
                          page={currentCommitPage}
                          hasNextPage={hasNextCommitPage}
                          hasPreviousPage={hasPreviousCommitPage}
                          onNextPage={handleNextCommitPage}
                          onPreviousPage={handlePreviousCommitPage}
                          isLoading={isCommitsFetching}
                        />
                      ) : (
                        <EmptyStateCard message="Коммиты не найдены для выбранных фильтров." />
                      )}
                    </div>
                  </div>
                </>
              )}
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

function ChartsSkeleton() {
  return (
    <>
      <Card className="rounded-3xl border-border/30 bg-card/80 p-6">
        <Skeleton className="h-5 w-40 rounded-md bg-muted/30" />
        <Skeleton className="mt-4 h-60 w-full rounded-2xl bg-muted/15" />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-3xl border-border/30 bg-card/80 p-6"
          >
            <Skeleton className="h-5 w-36 rounded-md bg-muted/30" />
            <Skeleton className="mt-4 h-52 w-full rounded-2xl bg-muted/15" />
          </Card>
        ))}
      </div>
    </>
  )
}

function DeveloperTableSkeleton() {
  return (
    <Card className="rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_50px_-26px_rgba(76,81,255,0.25)] backdrop-blur">
      <CardHeader className="border-border/10 border-b pb-4">
        <Skeleton className="h-4 w-64 rounded-full bg-muted/30" />
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

function ErrorStateCard({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card className="flex flex-col gap-3 rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
      <span className="font-semibold">{message}</span>
      <span className="text-xs text-destructive/80">
        Попробуйте изменить фильтры или повторить попытку.
      </span>
      <Button
        type="button"
        onClick={onRetry}
        size="sm"
        variant="outline"
        className="ml-auto border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        Повторить
      </Button>
    </Card>
  )
}

function RecommendationsCard({
  recommendations,
}: {
  recommendations: DeveloperRecommendation[]
}) {
  const severityConfig: Record<
    DeveloperRecommendation["severity"],
    { label: string; className: string }
  > = {
    info: {
      label: "Info",
      className:
        "border-emerald-300/40 bg-emerald-400/10 text-emerald-100 shadow-[0_0_25px_-12px_rgba(16,185,129,0.8)]",
    },
    warning: {
      label: "Warning",
      className:
        "border-amber-300/60 bg-amber-400/15 text-amber-900 shadow-[0_0_25px_-12px_rgba(245,158,11,0.8)]",
    },
    success: {
      label: "Positive",
      className:
        "border-teal-300/50 bg-teal-400/10 text-teal-100 shadow-[0_0_25px_-12px_rgba(45,212,191,0.75)]",
    },
    critical: {
      label: "Critical",
      className:
        "border-rose-400/40 bg-rose-500/15 text-rose-100 shadow-[0_0_25px_-12px_rgba(244,63,94,0.85)]",
    },
  }

  return (
    <Card className="rounded-3xl border-emerald-400/35 bg-emerald-400/15 p-6 text-foreground">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/20 p-3 text-emerald-900">
          <Lightbulb className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-900/70">
            Insights
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            Рекомендации для разработчика
          </h2>
        </div>
      </div>
      <ul className="mt-6 flex flex-col gap-4 text-sm">
        {recommendations.map((item) => {
          const severity = severityConfig[item.severity] ?? severityConfig.info
          return (
            <li
              key={item.id}
              className="group relative rounded-2xl border border-emerald-500/30 bg-emerald-100/40 p-4 transition hover:border-emerald-500/60"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold text-foreground">
                  {item.title}
                </span>
                <Badge
                  variant="secondary"
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${severity.className} text-emerald-900`}
                >
                  {severity.label}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-foreground/80">
                {item.description}
              </p>
              <div className="pointer-events-none absolute inset-x-3 bottom-2 h-px bg-emerald-500/40 opacity-0 transition group-hover:opacity-100" />
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
