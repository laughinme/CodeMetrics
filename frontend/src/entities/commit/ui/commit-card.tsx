"use client";

import { memo, useMemo } from "react";
import { GitCommit, GitMerge, Plus, Minus, FileDiff } from "lucide-react";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { formatDateTime, formatRelativeTimeFromNow } from "@/shared/lib/date";
import { cn } from "@/shared/lib/utils";

import type { Commit } from "../model/types";

type CommitCardProps = {
  commit: Commit;
  className?: string;
};

const getInitials = (name: string, email: string) => {
  const source = name?.trim().length ? name : email;
  if (!source) return "?";
  const [first, second] = source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2);
  if (first && second) {
    return `${first}${second}`;
  }
  if (first) return first;
  if (second) return second;
  return source[0]?.toUpperCase() ?? "?";
};

export function CommitCardComponent({ commit, className }: CommitCardProps) {
  const [title, description] = useMemo(() => {
    const [firstLine, ...rest] = commit.message.split("\n");
    const trimmedTitle = firstLine?.trim() || "Без сообщения";
    const body = rest.join("\n").trim();
    return [trimmedTitle, body];
  }, [commit.message]);

  const committedAtLabel = useMemo(
    () => formatDateTime(commit.committedAt),
    [commit.committedAt]
  );

  const committedRelative = useMemo(
    () => formatRelativeTimeFromNow(commit.committedAt),
    [commit.committedAt]
  );

  const shaShort = useMemo(() => commit.sha.slice(0, 7), [commit.sha]);
  const authorInitials = useMemo(
    () => getInitials(commit.authorName, commit.authorEmail),
    [commit.authorName, commit.authorEmail]
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-3xl border border-border/30 bg-card/70 p-5 shadow-sm transition hover:border-border/40 hover:bg-card/80",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {commit.isMerge ? (
              <GitMerge className="size-5" />
            ) : (
              <GitCommit className="size-5" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground/95">
                {title}
              </h3>
              {commit.isMerge && (
                <Badge
                  variant="secondary"
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary"
                >
                  Merge
                </Badge>
              )}
            </div>
            {description && (
              <p className="whitespace-pre-line text-sm text-muted-foreground/80">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
            {committedAtLabel}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {committedRelative}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-border/40 bg-muted">
            <AvatarFallback className="text-sm font-semibold text-foreground/80">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground/90">
              {commit.authorName}
            </span>
            <span className="text-xs text-muted-foreground/70">
              {commit.authorEmail}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground/80">
          <span className="flex items-center gap-1 text-emerald-500">
            <Plus className="size-4" />
            {commit.added}
          </span>
          <span className="flex items-center gap-1 text-rose-500">
            <Minus className="size-4" />
            {commit.deleted}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground/80">
            <FileDiff className="size-4" />
            {commit.filesChanged} файлов
          </span>
          <span className="flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1 font-mono text-[11px] tracking-wider text-foreground/80">
            {shaShort}
          </span>
        </div>
      </div>
    </div>
  );
}

export const CommitCard = memo(CommitCardComponent);
