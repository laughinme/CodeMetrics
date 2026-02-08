import type { CSSProperties } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "@/shared/api";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export default function IntegrationsPage() {
  const integrationsQuery = useQuery({
    queryKey: ["integrations"],
    queryFn: api.listIntegrations,
    retry: 1,
  });

  const syncMutation = useMutation({
    mutationFn: api.syncIntegration,
    onSuccess: async () => {
      await integrationsQuery.refetch();
    },
  });

  const integrations = integrationsQuery.data ?? [];
  const github = integrations.find((i) => i.provider === "github") ?? null;

  const connectMutation = useMutation({
    mutationFn: () => api.getGitHubAuthorizeUrl("/integrations"),
    onSuccess: (url) => {
      window.location.href = url;
    },
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 14 * 1.1)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Integrations" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-6 py-6">
              <div className="px-4 lg:px-6">
                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">GitHub</div>
                      <div className="text-sm text-muted-foreground">
                        OAuth App connection for syncing org repos, commits and diffs.
                      </div>
                      {github ? (
                        <div className="mt-3 text-sm">
                          <div>
                            Connected as:{" "}
                            <span className="font-medium">{github.external_login ?? "unknown"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Last sync:{" "}
                            {github.last_sync_at
                              ? new Date(github.last_sync_at).toLocaleString()
                              : "never"}
                            {github.last_sync_status ? ` (${github.last_sync_status})` : ""}
                          </div>
                          {github.last_sync_error ? (
                            <div className="mt-2 text-xs text-destructive whitespace-pre-wrap">
                              {github.last_sync_error}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-muted-foreground">
                          Not connected.
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {!github ? (
                        <button
                          className="btn primary"
                          onClick={() => connectMutation.mutate()}
                          disabled={integrationsQuery.isLoading || connectMutation.isPending}
                        >
                          {connectMutation.isPending ? "Redirecting..." : "Connect GitHub"}
                        </button>
                      ) : (
                        <button
                          className="btn primary"
                          onClick={() => syncMutation.mutate(github.id)}
                          disabled={syncMutation.isPending}
                        >
                          {syncMutation.isPending ? "Syncing..." : "Sync now"}
                        </button>
                      )}
                    </div>
                  </div>

                  {integrationsQuery.isError ? (
                    <div className="mt-4 text-sm text-destructive">
                      Failed to load integrations.
                    </div>
                  ) : null}

                  {connectMutation.isError ? (
                    <div className="mt-4 text-sm text-destructive">
                      Failed to start GitHub OAuth. Check backend logs and `GITHUB_OAUTH_CLIENT_ID/SECRET`.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
