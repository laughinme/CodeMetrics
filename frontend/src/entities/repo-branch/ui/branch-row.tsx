"use client";

import { memo, useMemo } from "react";
import { GitBranch } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { formatDateTime, formatRelativeTimeFromNow } from "@/shared/lib/date";
import { cn } from "@/shared/lib/utils";

import type { RepoBranch } from "../model/types";

type BranchRowProps = {
  branch: RepoBranch;
  className?: string;
};

function getCommitTitle(message: string | null | undefined) {
  if (!message) {
    return null;
  }
  const [firstLine] = message.split("\n");
  return firstLine?.trim() ?? null;
}

function BranchRowComponent({ branch, className }: BranchRowProps) {
  const commit = branch.latestCommit;
  const commitTitle = useMemo(
    () => getCommitTitle(commit?.message ?? ""),
    [commit?.message]
  );

  const committedAt = commit?.committedAt
    ? formatDateTime(commit.committedAt)
    : null;
  const committedRelative = commit?.committedAt
    ? formatRelativeTimeFromNow(commit.committedAt)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/20 bg-card/60 p-4 transition hover:border-border/30 hover:bg-card/70",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GitBranch className="size-4" />
          </div>
          <span className="text-base font-semibold text-foreground/90">
            {branch.name}
          </span>
          {branch.isDefault && (
            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Default
            </Badge>
          )}
        </div>
        {commit && (
          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
              {committedAt}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {committedRelative}
            </span>
          </div>
        )}
      </div>
      {commit ? (
        <div className="flex flex-col gap-1 text-sm text-muted-foreground/80">
          {commitTitle && (
            <span className="text-sm font-medium text-foreground/85">
              {commitTitle}
            </span>
          )}
          <span>
            Последний коммит от{" "}
            <span className="font-medium text-foreground/80">
              {commit.authorName}
            </span>{" "}
            ({commit.authorEmail})
          </span>
          <span className="text-xs font-mono text-muted-foreground/70">
            {commit.sha.slice(0, 7)}
          </span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground/70">
          Для этой ветки нет коммитов.
        </span>
      )}
    </div>
  );
}

export const BranchRow = memo(BranchRowComponent);
