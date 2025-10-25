"use client"

import { memo, type ComponentType } from "react";
import { Clock, Eye, EyeOff, GitBranch } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { ProjectDetailVM } from "../model/types";

type ProjectDetailsSummaryProps = {
  project: ProjectDetailVM;
  className?: string;
};

function ProjectDetailsSummaryComponent({
  project,
  className,
}: ProjectDetailsSummaryProps) {
  const isPublic = project.badge === "Public";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card className="rounded-3xl border-border/30 bg-card/80 p-6 shadow-[0_10px_50px_-26px_rgba(76,81,255,0.25)] backdrop-blur">
        <CardHeader className="flex flex-col gap-4 px-0 pb-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                {project.title}
              </CardTitle>
              {project.description ? (
                <CardDescription className="max-w-3xl text-base text-muted-foreground/85">
                  {project.description}
                </CardDescription>
              ) : (
                <CardDescription className="text-muted-foreground/70">
                  Описание отсутствует.
                </CardDescription>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-2 rounded-full border-border/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide",
                isPublic
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-amber-500/10 text-amber-300"
              )}
            >
              {isPublic ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <KpiCard
          label="Репозитории"
          value={project.repos.toLocaleString("ru-RU")}
          icon={GitBranch}
          description="Количество репозиториев, подключенных к проекту"
        />
        <KpiCard
          label="Доступ"
          value={isPublic ? "Публичный" : "Приватный"}
          icon={isPublic ? Eye : EyeOff}
          description="Уровень доступа к проекту"
        />
        <KpiCard
          label="Последняя активность"
          value={project.lastActivity}
          icon={Clock}
          description="Дата последнего обновления проекта"
        />
      </div>
    </div>
  );
}

type KpiCardProps = {
  label: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

function KpiCard({
  label,
  value,
  description,
  icon: Icon,
}: KpiCardProps) {
  return (
    <Card className="flex flex-col gap-3 rounded-2xl border-border/25 bg-card/65 p-4 shadow-[0_10px_30px_-30px_rgba(76,81,255,0.45)] backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-0 pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
          {label}
        </CardTitle>
        <div className="rounded-xl border border-border/30 bg-background/40 p-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 px-0">
        <span className="text-lg font-semibold text-foreground/90">
          {value}
        </span>
        <span className="text-xs text-muted-foreground/80">{description}</span>
      </CardContent>
    </Card>
  );
}

export const ProjectDetailsSummary = memo(ProjectDetailsSummaryComponent);
