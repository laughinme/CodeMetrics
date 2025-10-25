import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import {
  getDeveloperProfileSummary,
  type DeveloperProfileSummaryParams,
} from "@/shared/api/developerProfile"

import { toDeveloperProfileSummary } from "./adapters"
import type { DeveloperProfileSummary } from "./types"

type DeveloperProfileFilters = {
  since: Date | string
  until: Date | string
  project_id?: number | null
  repoIds?: string[] | null
}

type UseDeveloperProfileSummaryParams = DeveloperProfileFilters & {
  authorId: string | null | undefined
  latestCommitsLimit?: number
}

const normalizeDate = (value: Date | string) =>
  typeof value === "string" ? value : value.toISOString().slice(0, 10)

const toSummaryParams = (
  authorId: string,
  filters: DeveloperProfileFilters,
  latestCommitsLimit?: number,
): DeveloperProfileSummaryParams => ({
  authorId,
  since: filters.since,
  until: filters.until,
  projectId: filters.project_id ?? null,
  repoIds: filters.repoIds && filters.repoIds.length ? [...filters.repoIds] : null,
  limit: latestCommitsLimit,
})

const keyFromArgs = (
  authorId: string | null | undefined,
  filters: DeveloperProfileFilters,
  latestCommitsLimit?: number,
) =>
  [
    "developer-profile-summary",
    authorId,
    {
      since: normalizeDate(filters.since),
      until: normalizeDate(filters.until),
      project_id: filters.project_id ?? null,
      repoIds: filters.repoIds && filters.repoIds.length ? [...filters.repoIds].sort() : null,
      latestCommitsLimit: latestCommitsLimit ?? null,
    },
  ] as const

export function useDeveloperProfileSummary({
  authorId,
  since,
  until,
  project_id,
  repoIds,
  latestCommitsLimit,
}: UseDeveloperProfileSummaryParams): UseQueryResult<DeveloperProfileSummary> {
  const filters: DeveloperProfileFilters = {
    since,
    until,
    project_id,
    repoIds,
  }

  const queryKey = keyFromArgs(authorId ?? null, filters, latestCommitsLimit)

  return useQuery({
    queryKey,
    enabled: Boolean(authorId),
    queryFn: async () => {
      if (!authorId) {
        throw new Error("Developer id is required")
      }

      const params = toSummaryParams(authorId, filters, latestCommitsLimit)
      const dto = await getDeveloperProfileSummary(params)
      return toDeveloperProfileSummary(dto)
    },
    staleTime: 60_000,
    keepPreviousData: true,
  })
}
