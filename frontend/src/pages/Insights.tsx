import { useMemo } from "react"
import type { CSSProperties } from "react"

import { MagicWandIcon } from "@radix-ui/react-icons"

import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { Button } from "@/shared/components/ui/button"
import { InsightsFeedWidget } from "@/widgets/insights-feed"

const getDefaultRange = () => {
  const until = new Date()
  const since = new Date(until)
  since.setDate(until.getDate() - 29)
  return { since, until }
}

export default function InsightsPage() {
  const { since, until } = useMemo(getDefaultRange, [])

  const queryParams = useMemo(
    () => ({
      since,
      until,
      projectId: null,
    }),
    [since, until],
  )

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
          description="Персонализированные рекомендации по активности команды"
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col gap-6 py-6">
              <div className="flex flex-col gap-6 px-4 lg:px-6">
                <InsightsFeedWidget params={queryParams} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
