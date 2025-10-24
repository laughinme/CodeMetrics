"use client"

import { memo } from "react";

import { RepoCard, useReposList } from "@/entities/repos";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type ProjectRepoListWidgetProps = {
  projectId: number | null | undefined;
  className?: string;
};

function ProjectRepoListWidgetComponent({
  projectId,
  className,
}: ProjectRepoListWidgetProps) {
  const { data, isLoading, error, refetch } = useReposList(projectId, {
    enabled: projectId != null,
  });

  if (!projectId) {
    return (
      <Card className={cn("rounded-3xl border-dashed border-border/40 bg-card/60 p-6 text-center text-sm text-muted-foreground", className)}>
        Выберите проект, чтобы увидеть список репозиториев.
      </Card>
    );
  }

  if (isLoading && !data) {
    return (
      <div className={cn("grid grid-cols-1 gap-4", className)}>
        <ProjectRepoListSkeleton />
      </div>
    );
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return (
      <Card className={cn("rounded-3xl border-border/30 bg-destructive/10 p-6 text-sm text-destructive", className)}>
        <div className="flex flex-col gap-2">
          <span>Не удалось загрузить репозитории проекта.</span>
          <span className="text-xs text-destructive/90">
            {message}
          </span>
          <button
            type="button"
            onClick={refetch}
            className="ml-auto rounded-full border border-destructive/40 bg-destructive/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-destructive transition hover:bg-destructive/15"
          >
            Повторить
          </button>
        </div>
      </Card>
    );
  }

  const repos = data ?? [];

  if (repos.length === 0) {
    return (
      <Card className={cn("rounded-3xl border-border/30 bg-card/70 p-6 text-center text-sm text-muted-foreground", className)}>
        Репозитории отсутствуют.
      </Card>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2", className)}>
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}

function ProjectRepoListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="flex h-full flex-col gap-4 rounded-3xl border-border/30 bg-card/60 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-1/2 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/5 rounded-md" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </Card>
      ))}
    </>
  );
}

export const ProjectRepoListWidget = memo(ProjectRepoListWidgetComponent);
