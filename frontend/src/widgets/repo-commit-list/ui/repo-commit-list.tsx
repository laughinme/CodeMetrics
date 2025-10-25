"use client";

import { memo, useEffect, useRef } from "react";
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

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (!hasNextPage) return;

    let blocked = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && !blocked && !isFetchingNextPage) {
          blocked = true;
          fetchNextPage().finally(() => {
            blocked = false;
          });
        }
      },
      {
        root: null,
        rootMargin: "200px 0px 200px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
      <div ref={sentinelRef} className="h-1 w-full" />
      {hasNextPage && isFetchingNextPage && (
        <div className="flex justify-center py-4 text-sm text-muted-foreground/70">
          <Loader2 className="size-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

export const RepoCommitListWidget = memo(RepoCommitListWidgetComponent);
