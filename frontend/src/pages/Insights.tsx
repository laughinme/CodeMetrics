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
          title="Insights"/>
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
