"use client";

import { memo } from "react";

import {
  BranchRow,
  BranchRowSkeleton,
  useRepoBranches,
} from "@/entities/repo-branch";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type RepoBranchListWidgetProps = {
  repoId: string | null | undefined;
  className?: string;
};

function RepoBranchListWidgetComponent({
  repoId,
  className,
}: RepoBranchListWidgetProps) {
  const normalizedRepoId =
    typeof repoId === "string" && repoId.trim().length > 0 ? repoId.trim() : null;

  const { data, isLoading, error, refetch } = useRepoBranches(normalizedRepoId);
  const branches = data ?? [];

  if (!normalizedRepoId) {
    return (
      <Card
        className={cn(
          "rounded-3xl border-dashed border-border/40 bg-card/60 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Выберите репозиторий, чтобы посмотреть ветки.
      </Card>
    );
  }

  if (isLoading && branches.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <BranchRowSkeleton />
        <BranchRowSkeleton />
        <BranchRowSkeleton />
      </div>
    );
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return (
      <Card
        className={cn(
          "rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive",
          className
        )}
      >
        <div className="flex flex-col gap-3">
          <div>
            <span className="font-semibold">Не удалось загрузить ветки.</span>
            <div className="text-xs text-destructive/80">{message}</div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-auto border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            Повторить
          </Button>
        </div>
      </Card>
    );
  }

  if (branches.length === 0) {
    return (
      <Card
        className={cn(
          "rounded-3xl border border-border/30 bg-card/60 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Ветки отсутствуют.
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {branches.map((branch) => (
        <BranchRow key={branch.name} branch={branch} />
      ))}
    </div>
  );
}

export const RepoBranchListWidget = memo(RepoBranchListWidgetComponent);
