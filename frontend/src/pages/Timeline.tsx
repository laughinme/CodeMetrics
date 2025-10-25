import * as React from "react"
import type { CSSProperties } from "react"

import { TimelineFilters, useTimelineFilters } from "@/features/timeline-filters"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { TimelineOverviewWidget } from "@/widgets/timeline-overview"
import type { TimelineRange } from "@/entities/timeline"

export default function TimelinePage() {
  const {
    range,
    setRange,
    rangeOptions,
    projectId,
    setProjectId,
    since,
    until,
  } = useTimelineFilters()

  const handleRangeChange = React.useCallback(
    (value: TimelineRange) => {
      setRange(value)
    },
    [setRange],
  )

  const handleProjectChange = React.useCallback(
    (value: number | null) => {
      setProjectId(value)
    },
    [setProjectId],
  )

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 14 * 1.1)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title="Timeline"
          description="Фильтры применяются ко всем виджетам на странице"
          filters={
            <TimelineFilters
              range={range}
              onRangeChange={handleRangeChange}
              rangeOptions={rangeOptions}
              projectId={projectId}
              onProjectChange={handleProjectChange}
            />
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-6 py-6">
              <div className="px-4 lg:px-6">
                <TimelineOverviewWidget
                  projectId={projectId}
                  range={range}
                  onRangeChange={handleRangeChange}
                  rangeOptions={rangeOptions}
                  since={since}
                  until={until}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
