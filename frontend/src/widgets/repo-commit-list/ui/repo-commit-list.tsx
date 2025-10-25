"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";

import {
  CommitCard,
  CommitCardSkeleton,
  useRepoCommits,
} from "@/entities/commit";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { RepoCommitsParams } from "@/shared/api/repoCommits";

type RepoCommitListWidgetProps = {
  repoId: string | null | undefined;
  params?: RepoCommitsParams;
  className?: string;
};

function RepoCommitListWidgetComponent({
  repoId,
  params,
  className,
}: RepoCommitListWidgetProps) {
  const normalizedRepoId =
    typeof repoId === "string" && repoId.trim().length > 0 ? repoId.trim() : null;

  const {
    commits,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useRepoCommits(normalizedRepoId, params);

  if (!normalizedRepoId) {
    return (
      <Card
        className={cn(
          "rounded-3xl border-dashed border-border/40 bg-card/60 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Выберите репозиторий, чтобы посмотреть коммиты.
      </Card>
    );
  }

  if (isLoading && commits.length === 0) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <CommitCardSkeleton />
        <CommitCardSkeleton />
        <CommitCardSkeleton />
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
            <span className="font-semibold">Не удалось загрузить коммиты.</span>
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

  if (commits.length === 0) {
    return (
      <Card
        className={cn(
          "rounded-3xl border border-border/30 bg-card/60 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Коммиты отсутствуют.
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {commits.map((commit) => (
        <CommitCard key={commit.sha} commit={commit} />
      ))}
      {hasNextPage && (
        <Button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          variant="outline"
          className="ml-auto flex items-center gap-2 rounded-full border-border/40 bg-background/60 px-5 py-2 text-sm font-medium text-foreground/80 transition hover:bg-background/80"
        >
          {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
          Загрузить ещё
        </Button>
      )}
    </div>
  );
}

export const RepoCommitListWidget = memo(RepoCommitListWidgetComponent);
