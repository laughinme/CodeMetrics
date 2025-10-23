import { AppSidebar } from "@/shared/components/app-sidebar"
import { ChartAreaInteractive } from "@/shared/components/chart-area-interactive"
import { DataTable } from "@/shared/components/data-table"
import { SectionCards } from "@/shared/components/section-cards"
import { SiteHeader } from "@/shared/components/site-header"
import { Button } from "@/shared/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import {
  Calendar,
  Folder,
  GitBranch,
  Users,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"

type DashboardFilter = {
  id: string
  label: string
  value: string
  icon: LucideIcon
}

const dashboardFilters: DashboardFilter[] = [
  {
    id: "period",
    label: "Period",
    value: "01.04.2024 - 30.04.2024",
    icon: Calendar,
  },
  {
    id: "developers",
    label: "Developers",
    value: "All developers",
    icon: Users,
  },
  {
    id: "project",
    label: "Project",
    value: "CodeMetrics Platform",
    icon: Folder,
  },
  {
    id: "repository",
    label: "Repository",
    value: "frontend-monorepo",
    icon: GitBranch,
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
          filters={dashboardFilters.map(({ id, label, value, icon: Icon }) => (
            <Button
              key={id}
              variant="outline"
              size="lg"
              className="h-11 min-w-[180px] justify-between gap-2.5 px-3 text-left"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-medium uppercase text-muted-foreground tracking-wide">
                    {label}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {value}
                  </span>
                </span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          ))}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
