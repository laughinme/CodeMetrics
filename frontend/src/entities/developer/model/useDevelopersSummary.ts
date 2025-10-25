import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getDevelopersSummary, type DevelopersSummaryParams } from "@/shared/api/developersSummary";
import { toDevelopersSummary } from "@/entities/developer/model/adapters";
import type { DevelopersSummary } from "@/entities/developer/model/types";

const keyFromParams = (p: DevelopersSummaryParams) =>
  ([
    "dev-summary",
    {
      since: typeof p.since === "string" ? p.since : p.since.toISOString().slice(0,10),
      until: typeof p.until === "string" ? p.until : p.until.toISOString().slice(0,10),
      project_id: p.project_id ?? null,
      repoIds: p.repoIds && p.repoIds.length ? [...p.repoIds].sort() : null,
    },
  ] as const);

export function useDevelopersSummary(
  params: DevelopersSummaryParams
): UseQueryResult<DevelopersSummary> {
  const key = keyFromParams(params);
  const enabled = Boolean(params.since && params.until);

  return useQuery({
    queryKey: key,
    queryFn: () => getDevelopersSummary(params).then(toDevelopersSummary),
    enabled,
    keepPreviousData: true,
    staleTime: 60_000,
    retry: 0,
    select: (d) => ({
      ...d,
      authors: [...d.authors].sort((a, b) => b.commits - a.commits),
    }),
  });
}