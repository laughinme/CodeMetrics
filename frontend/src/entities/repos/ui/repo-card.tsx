"use client"

import { memo, useMemo } from "react";
import { GitBranch, Clock } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";

import type { Repo } from "../model/types";

type RepoCardProps = {
  repo: Repo;
  className?: string;
};

function RepoCardComponent({ repo, className }: RepoCardProps) {
  const updatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(repo.updatedAt),
    [repo.updatedAt]
  );

  return (
    <Card
      className={cn(
        "rounded-3xl border-border/30 bg-card/80 p-5 shadow-[0_10px_50px_-26px_rgba(76,81,255,0.18)] backdrop-blur transition hover:border-border/40 hover:bg-card/90",
        className
      )}
    >
      <CardHeader className="px-0 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {repo.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              {repo.description ?? "Описание отсутствует"}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-1 rounded-full border-border/30 bg-background/40 text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            <GitBranch className="h-3.5 w-3.5" />
            {repo.defaultBranch}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-2 px-0 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 text-muted-foreground/80" />
        <span className="text-muted-foreground/90">
          Последнее обновление <span className="font-medium text-foreground/85">{updatedAt}</span>
        </span>
      </CardContent>
    </Card>
  );
}

export const RepoCard = memo(RepoCardComponent);
