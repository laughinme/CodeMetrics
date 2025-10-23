import { AppSidebar } from "@/shared/components/app-sidebar"
import { CommitActivityWidget } from "@/widgets/commit-activity"
import { CommitHourlyHeatmapWidget } from "@/widgets/commit-hourly-heatmap"
import { CommitTopAuthorsWidget } from "@/widgets/commit-top-authors"
import { DataTable } from "@/shared/components/data-table"
import {
  SectionCards,
  type SectionCard,
} from "@/shared/components/section-cards"
import { SiteHeader } from "@/shared/components/site-header"
import { Button } from "@/shared/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { ChevronDown } from "lucide-react"

type DashboardFilter = {
  id: string
  label: string
  selected?: string
}

const dashboardFilters: DashboardFilter[] = [
  {
    id: "period",
    label: "Date Range",
    selected: "01.04.2024 – 30.04.2024",
  },
  {
    id: "project",
    label: "Project",
    selected: "CodeMetrics Platform",
  },
  {
    id: "developers",
    label: "Team",
    selected: "All developers",
  },
  {
    id: "repository",
    label: "Repository",
    selected: "frontend-monorepo",
  },
]

const dashboardKpiCards: SectionCard[] = [
  {
    id: "commits-total",
    label: "Total Commits",
    value: "182",
    secondary: "за период 01.04 – 30.04",
    change: {
      value: "+12%",
      variant: "positive",
    },
    caption: "На 12% больше, чем в прошлом периоде",
  },
  {
    id: "active-developers",
    label: "Active Developers",
    value: "18",
    secondary: "уникальные авторы",
    change: {
      value: "+3 чел.",
      variant: "positive",
    },
  },
  {
    id: "active-repositories",
    label: "Active Repos",
    value: "7",
    secondary: "репозитории с коммитами",
    change: {
      value: "+1 репозиторий",
      variant: "positive",
    },
  },
  {
    id: "commit-size",
    label: "Avg / Median Commit Size",
    value: "142 / 95",
    secondary: "строк (added + deleted)",
    change: {
      value: "-8 строк",
      variant: "negative",
    },
  },
  {
    id: "short-messages-share",
    label: "Short Msg %",
    value: "28%",
    secondary: "< 50 символов",
    change: {
      value: "+4 п.п.",
      variant: "negative",
    },
    caption: "Рекомендуем отслеживать качество сообщений",
  },
]

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title="Dashboard"
          filters={dashboardFilters.map(({ id, label }) => (
            <Button
              key={id}
              variant="outline"
              size="lg"
              className="h-10 min-w-[140px] justify-between rounded-full border-border/60 bg-background/70 px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background/60 focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-white/15 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
            >
              <span>{label}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          ))}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards cards={dashboardKpiCards} />
              <div className="px-4 lg:px-6">
                <div className="@container/card grid gap-4 lg:grid-cols-2">
                  <CommitTopAuthorsWidget />
                  <CommitActivityWidget />
                </div>
                <div className="mt-4">
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
