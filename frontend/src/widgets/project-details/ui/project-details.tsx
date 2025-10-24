"use client"

import { memo } from "react";

import { ProjectDetailsSummary, useProjectDetails } from "@/entities/projectDetails";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

type ProjectDetailsWidgetProps = {
  projectId: number | string | null | undefined;
  className?: string;
};

function ProjectDetailsWidgetComponent({
  projectId,
  className,
}: ProjectDetailsWidgetProps) {
  const { data, isLoading, error, view, refetch, isRefetching } =
    useProjectDetails(projectId, {
      enabled: projectId != null,
    });

  if (!projectId) {
    return (
      <Card className="rounded-3xl border-dashed border-border/40 bg-card/60 p-6 text-center text-sm text-muted-foreground">
        Выберите проект, чтобы увидеть его детали.
      </Card>
    );
  }

  if ((isLoading || isRefetching) && !data) {
    return <ProjectDetailsSkeleton />;
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return (
      <Card className="rounded-3xl border-border/30 bg-destructive/10 p-6 text-sm text-destructive">
        <div className="flex flex-col gap-2">
          <span>Не удалось загрузить данные проекта.</span>
          <span className="text-xs text-destructive/90">{message}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-auto rounded-full border border-destructive/40 bg-destructive/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-destructive transition hover:bg-destructive/15"
          >
            Повторить
          </button>
        </div>
      </Card>
    );
  }

  if (!view) {
    return (
      <Card className="rounded-3xl border-border/30 bg-card/70 p-6 text-center text-sm text-muted-foreground">
        Данные проекта недоступны.
      </Card>
    );
  }

  return <ProjectDetailsSummary project={view} className={className} />;
}

function ProjectDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-3xl border-border/30 bg-card/70 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-6 w-1/2 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="flex flex-col gap-4 rounded-3xl border-border/30 bg-card/60 p-5"
          >
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-8 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export const ProjectDetailsWidget = memo(ProjectDetailsWidgetComponent);
