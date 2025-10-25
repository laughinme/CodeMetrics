import type { CSSProperties } from "react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { GitBranch, Clock } from "lucide-react";

import { RepoCommitListWidget } from "@/widgets/repo-commit-list";
import { RepoBranchListWidget } from "@/widgets/repo-branch-list";
import { useReposList } from "@/entities/repos";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatDateTime } from "@/shared/lib/date";

export default function RepoDetailPage() {
  const { projectId: projectIdParam, repoId: repoIdParam } = useParams<{
    projectId: string;
    repoId: string;
  }>();

  const projectIdNumber = projectIdParam ? Number(projectIdParam) : NaN;
  const projectId = Number.isFinite(projectIdNumber) ? projectIdNumber : null;

  const {
    data: repos,
    isLoading: isReposLoading,
    error: reposError,
    refetch: refetchRepos,
  } = useReposList(projectId, { enabled: projectId != null });

  const repo = useMemo(
    () => repos?.find((item) => item.id === repoIdParam) ?? null,
    [repos, repoIdParam]
  );

  const updatedAt = repo ? formatDateTime(repo.updatedAt) : null;
  const backTarget = projectIdParam ? `/projects/${projectIdParam}` : "/projects";
  const title = repo ? repo.name : "Детали репозитория";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title={title}
          actions={
            <Link
              to={backTarget}
              className="flex h-10 items-center gap-2 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70"
            >
              Вернуться к проекту
            </Link>
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-6 py-6">
              <div className="flex flex-col gap-8 px-4 lg:px-6">
                <RepoSummarySection
                  isLoading={isReposLoading}
                  error={reposError}
                  onRetry={refetchRepos}
                  repoName={repo?.name}
                  repoDescription={repo?.description}
                  defaultBranch={repo?.defaultBranch}
                  updatedAt={updatedAt}
                />
                <div className="grid gap-8 lg:grid-cols-5">
                  <section className="flex flex-col gap-4 lg:col-span-3">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-lg font-semibold text-foreground/90">
                        Коммиты
                      </h2>
                    </div>
                    <Separator className="bg-border/40" />
                    <RepoCommitListWidget
                      repoId={repoIdParam ?? null}
                      params={{ limit: 20 }}
                    />
                  </section>
                  <section className="flex flex-col gap-4 lg:col-span-2">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-lg font-semibold text-foreground/90">
                        Ветки
                      </h2>
                    </div>
                    <Separator className="bg-border/40" />
                    <RepoBranchListWidget
                      repoId={repoIdParam ?? null}
                      params={{ limit: 20 }}
                    />
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

type RepoSummarySectionProps = {
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  repoName: string | undefined | null;
  repoDescription: string | undefined | null;
  defaultBranch: string | undefined;
  updatedAt: string | null;
};

function RepoSummarySection({
  isLoading,
  error,
  onRetry,
  repoName,
  repoDescription,
  defaultBranch,
  updatedAt,
}: RepoSummarySectionProps) {
  if (isLoading && !repoName) {
    return <RepoSummarySkeleton />;
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return (
      <Card className="flex flex-col gap-3 rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        <span className="font-semibold">
          Не удалось загрузить данные репозитория.
        </span>
        <span className="text-xs text-destructive/80">{message}</span>
        <Button
          type="button"
          onClick={() => onRetry()}
          size="sm"
          variant="outline"
          className="ml-auto border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          Повторить
        </Button>
      </Card>
    );
  }

  if (!repoName) {
    return (
      <Card className="rounded-3xl border-dashed border-border/40 bg-card/60 p-6 text-center text-sm text-muted-foreground">
        Репозиторий не найден или недоступен.
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6 rounded-3xl border border-border/30 bg-card/70 p-6 shadow-[0_10px_50px_-26px_rgba(76,81,255,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground/95">
            {repoName}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground/80">
            {repoDescription && repoDescription.trim().length > 0
              ? repoDescription
              : "Описание отсутствует."}
          </p>
        </div>
        <Badge className="flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
          <GitBranch className="size-4 text-primary" />
          {defaultBranch ?? "main"}
        </Badge>
      </div>
      <Separator className="bg-border/40" />
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground/80">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground/70" />
          <span>
            Обновлён:{" "}
            <span className="font-medium text-foreground/85">
              {updatedAt ?? "—"}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}

function RepoSummarySkeleton() {
  return (
    <Card className="flex flex-col gap-6 rounded-3xl border border-border/20 bg-card/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-7 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <Separator className="bg-border/20" />
      <Skeleton className="h-4 w-44 rounded-md" />
    </Card>
  );
}
