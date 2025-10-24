import type { ReactNode } from "react"

import { Separator } from "@/shared/components/ui/separator"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"

type SiteHeaderProps = {
  title?: string
  description?: string
  filters?: ReactNode
  actions?: ReactNode
}

export function SiteHeader({
  title = "Documents",
  description,
  filters,
  actions,
}: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b bg-background/95 transition-[width,height] ease-linear backdrop-blur supports-[backdrop-filter]:bg-background/80 group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-3 px-4 lg:gap-5 lg:px-6">
        <div className="flex shrink-0 items-start gap-2 lg:gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-6"
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold leading-tight lg:text-2xl">
              {title}
            </h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {(filters || actions) && (
          <div className="ml-auto flex items-center gap-2 lg:gap-3">
            {filters ? <div className="flex items-center gap-2">{filters}</div> : null}
            {actions ? (
              <div className="flex items-center gap-2">{actions}</div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  )
}
