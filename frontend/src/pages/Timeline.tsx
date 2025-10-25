import * as React from "react"
import type { CSSProperties } from "react"

import { GitBranch } from "lucide-react"

import { useProjectCardsList } from "@/entities/project"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { TimelineOverviewWidget } from "@/widgets/timeline-overview"

export default function TimelinePage() {
  const { data: projects, isLoading: isProjectsLoading } =
    useProjectCardsList()

  const [selectedProjectId, setSelectedProjectId] = React.useState<
    number | null
  >(null)

  const selectValue =
    selectedProjectId !== null ? String(selectedProjectId) : "all"

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
            <Select
              value={selectValue}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedProjectId(null)
                } else {
                  setSelectedProjectId(Number(value))
                }
              }}
            >
              <SelectTrigger className="h-10 min-w-[200px] justify-start gap-2 rounded-full border-border/20 bg-muted/40 px-4 text-sm font-medium text-foreground/90 shadow-sm backdrop-blur hover:bg-muted/60 focus-visible:ring-0 focus-visible:ring-offset-0">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <SelectValue
                  placeholder={
                    isProjectsLoading ? "Загрузка..." : "Все проекты"
                  }
                />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="rounded-xl bg-popover/95 backdrop-blur"
              >
                <SelectItem value="all" className="rounded-lg text-sm">
                  Все проекты
                </SelectItem>
                <SelectSeparator />
                {isProjectsLoading ? (
                  <SelectItem value="loading" disabled className="rounded-lg text-sm">
                    Загрузка проектов…
                  </SelectItem>
                ) : projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={String(project.id)}
                      className="rounded-lg text-sm"
                    >
                      {project.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled className="rounded-lg text-sm">
                    Проекты недоступны
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-6 py-6">
              <div className="px-4 lg:px-6">
                <TimelineOverviewWidget projectId={selectedProjectId} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
