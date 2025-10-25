import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import {
  getDeveloperCommits,
  type DeveloperCommitsParams,
} from "@/shared/api/developerProfile"

import { toDeveloperCommitsFeed } from "./adapters"
import type { DeveloperCommitFeed } from "./types"

type DeveloperCommitsFilters = {
  since: Date | string
  until: Date | string
  project_id?: number | null
  repoIds?: string[] | null
}

type UseDeveloperCommitsParams = DeveloperCommitsFilters & {
  authorId: string | null | undefined
  limit?: number
  cursor?: string | null
}

const normalizeDate = (value: Date | string) =>
  typeof value === "string" ? value : value.toISOString().slice(0, 10)

const toCommitsParams = (
  authorId: string,
  filters: DeveloperCommitsFilters,
  limit?: number,
  cursor?: string | null,
): DeveloperCommitsParams => ({
  authorId,
  since: filters.since,
  until: filters.until,
  projectId: filters.project_id ?? null,
  repoIds: filters.repoIds && filters.repoIds.length ? [...filters.repoIds] : null,
  limit,
  cursor,
})

const keyFromArgs = (
  authorId: string | null | undefined,
  filters: DeveloperCommitsFilters,
  limit?: number,
  cursor?: string | null,
) =>
  [
    "developer-profile-commits",
    authorId,
    {
      since: normalizeDate(filters.since),
      until: normalizeDate(filters.until),
      project_id: filters.project_id ?? null,
      repoIds: filters.repoIds && filters.repoIds.length ? [...filters.repoIds].sort() : null,
      limit: limit ?? null,
      cursor: cursor ?? null,
    },
  ] as const

export function useDeveloperCommits({
  authorId,
  since,
  until,
  project_id,
  repoIds,
  limit,
  cursor,
}: UseDeveloperCommitsParams): UseQueryResult<DeveloperCommitFeed> {
  const filters: DeveloperCommitsFilters = {
    since,
    until,
    project_id,
    repoIds,
  }

  const queryKey = keyFromArgs(authorId ?? null, filters, limit, cursor ?? null)

  return useQuery({
    queryKey,
    enabled: Boolean(authorId),
    queryFn: async () => {
      if (!authorId) {
        throw new Error("Developer id is required")
      }

      const params = toCommitsParams(authorId, filters, limit, cursor ?? null)
      const dto = await getDeveloperCommits(params)
      return toDeveloperCommitsFeed(dto)
    },
    staleTime: 60_000,
    keepPreviousData: true,
  })
}
