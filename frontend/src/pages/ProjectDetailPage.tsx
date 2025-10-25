import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";

import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { ProjectDetailsWidget } from "@/widgets/project-details";
import { ProjectRepoListWidget } from "@/widgets/project-repo-list";

export default function ProjectDetailPage() {
  const { projectId: projectIdParam } = useParams<{ projectId: string }>();
  const projectIdNumber = projectIdParam ? Number(projectIdParam) : NaN;
  const projectId = Number.isFinite(projectIdNumber) ? projectIdNumber : null;

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
          title="Project details"
          actions={
            <Link
              to="/projects"
              className="flex h-10 items-center gap-2 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70"
            >
              Вернуться к списку
            </Link>
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-6 py-6">
              <div className="flex flex-col gap-10 px-4 lg:px-6">
                <ProjectDetailsWidget projectId={projectIdParam ?? null} />
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground/90">
                      Репозитории
                    </h2>
                  </div>
                  <Separator className="bg-border/40" />
                  <ProjectRepoListWidget projectId={projectId} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
