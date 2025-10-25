import type { CSSProperties } from "react"
import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Mail } from "lucide-react"

import {
  DeveloperActivityChart,
  DeveloperCommitsTable,
  DeveloperHourlyPatternChart,
  DeveloperWeekdayPatternChart,
  getDeveloperProfileByIdMock,
  type DeveloperProfileMetric,
} from "@/entities/developer-profile"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { SectionCards } from "@/shared/components/section-cards"
import { SiteHeader } from "@/shared/components/site-header"
import { Badge } from "@/shared/components/ui/badge"
import { Card } from "@/shared/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"

const layoutStyle = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 14)",
} as CSSProperties

export default function DeveloperProfilePage() {
  const { developerId } = useParams<{ developerId: string }>()

  const profile = useMemo(
    () =>
      developerId ? getDeveloperProfileByIdMock(developerId) : null,
    [developerId],
  )

  const summaryCards = useMemo<DeveloperProfileMetric[]>(
    () => (profile ? [...profile.summary] : []),
    [profile],
  )

  const activityData = useMemo(
    () =>
      profile
        ? [...profile.dailyActivity].sort(
            (a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
        : [],
    [profile],
  )

  const pageTitle = profile
    ? `Профиль разработчика ${profile.name}`
    : "Профиль разработчика"

  return (
    <SidebarProvider style={layoutStyle}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title={pageTitle}
          description={profile?.email}
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
              {profile ? (
                <>
                  <div className="flex flex-col gap-4 px-4 lg:px-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-2 rounded-full border-border/40 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/90"
                      >
                        <Mail className="h-3.5 w-3.5 text-primary" />
                        {profile.email}
                      </Badge>
                    </div>
                  </div>
                  <SectionCards cards={summaryCards} />
                  <div className="flex flex-col gap-8 px-4 lg:px-6">
                    <DeveloperActivityChart data={activityData} />
                    <div className="grid gap-6 lg:grid-cols-2">
                      <DeveloperHourlyPatternChart
                        data={profile.hourlyPattern}
                      />
                      <DeveloperWeekdayPatternChart
                        data={profile.weekdayPattern}
                      />
                    </div>
                    <DeveloperCommitsTable commits={profile.commits} />
                  </div>
                </>
              ) : (
                <div className="px-4 lg:px-6">
                  <Card className="rounded-3xl border-dashed border-border/40 bg-card/60 p-6 text-center text-sm text-muted-foreground">
                    Разработчик не найден. Вернитесь на список разработчиков.
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
