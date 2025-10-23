import type { ReactNode } from "react"
import { Separator } from "@/shared/components/ui/separator"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"

type SiteHeaderProps = {
  title?: string
  filters?: ReactNode
}

export function SiteHeader({ title = "Documents", filters }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-3 px-4 lg:gap-4 lg:px-6">
        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        {filters ? (
          <div className="flex flex-1 justify-center">
            <div className="flex items-center gap-2 overflow-x-auto">
              {filters}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
