import type { CSSProperties } from "react"

import { GitBranch, History } from "lucide-react"

import {
  developerFilters,
  developerKpiCards,
} from "@/entities/developer"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { SectionCards } from "@/shared/components/section-cards"
import { SiteHeader } from "@/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { DeveloperListWidget } from "@/widgets/developer-list"

export default function DevelopersPage() {
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
          title="Developers"
          description="Фильтры применяются ко всем виджетам на странице"
          filters={
            <>
              <button className="flex h-11 items-center gap-2 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                {developerFilters.project.label}
              </button>
              <button className="flex h-11 items-center gap-2 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70">
                <History className="h-4 w-4 text-muted-foreground" />
                {developerFilters.period.label}
              </button>
            </>
          }
          
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-6 py-6">
              <SectionCards cards={developerKpiCards} />
              <div className="px-4 lg:px-6">
                <DeveloperListWidget />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
