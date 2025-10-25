import type { CSSProperties } from "react"

import { CalendarRange, GitBranch, Sparkles } from "lucide-react"

import {
  insightFilters,
  insightMetrics,
  insightObservation,
  InsightMetricsGrid,
  InsightObservationCard,
} from "@/entities/insight"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { Button } from "@/shared/components/ui/button"

export default function InsightsPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title="Insights"
          description="Фильтры применяются ко всем виджетам на странице"
          filters={
            <>
              <button className="flex h-11 items-center gap-2 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                {insightFilters.project.label}
              </button>
              <button className="flex h-11 items-center gap-2 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                {insightFilters.period.label}
              </button>
            </>
          }
          actions={
            <Button
              size="lg"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              New Analysis
            </Button>
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col gap-6 py-6">
              <div className="flex flex-col gap-6 px-4 lg:px-6">
                <InsightMetricsGrid items={insightMetrics} />
                <InsightObservationCard observation={insightObservation} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
