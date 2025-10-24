import { useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { GitBranch } from "lucide-react"

import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import {
  SectionCards,
  type SectionCard,
} from "@/shared/components/section-cards"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { CommitActivityWidget } from "@/widgets/commit-activity"
import { CommitHourlyHeatmapWidget } from "@/widgets/commit-hourly-heatmap"
import { CommitTopAuthorsWidget } from "@/widgets/commit-top-authors"

const dashboardKpiCards: SectionCard[] = [
  {
    id: "commits-total",
    label: "Всего коммитов",
    value: "195",
    secondary: "за период 30 дн.",
  },
  {
    id: "active-developers",
    label: "Уникальных разработчиков",
    value: "7",
  },
  {
    id: "active-repositories",
    label: "Активных репозиториев",
    value: "6",
  },
  {
    id: "commit-size",
    label: "Avg / Median Commit Size",
    value: "74 / 44",
  },
  {
    id: "short-messages-share",
    label: "Short Msg %",
    value: "19%",
    secondary: "< 50 символов",
  },
]

export default function Page() {
  const projectOptions = useMemo(
    () => [
      { value: "all", label: "All projects" },
      { value: "frontend", label: "Frontend redesign" },
      { value: "platform", label: "Platform core" },
      { value: "ml", label: "ML services" },
    ],
    []
  )

  const [selectedProject, setSelectedProject] = useState(projectOptions[0]?.value)

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
          title="Dashboard"
          description="Фильтры применяются ко всем виджетам на странице"
          filters={
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-10 min-w-[180px] justify-start gap-2 rounded-full border-border/20 bg-muted/40 px-4 text-sm font-medium text-foreground/90 shadow-sm backdrop-blur hover:bg-muted/60 focus-visible:ring-0 focus-visible:ring-offset-0">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl bg-popover/95 backdrop-blur">
                {projectOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value} className="rounded-lg text-sm">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards cards={dashboardKpiCards} />
              <div className="flex flex-col gap-6 px-4 lg:px-6">
                <CommitActivityWidget />
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] xl:grid-cols-2">
                  <CommitTopAuthorsWidget />
                  <CommitHourlyHeatmapWidget />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
