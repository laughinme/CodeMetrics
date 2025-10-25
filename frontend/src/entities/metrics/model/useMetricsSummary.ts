import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import {
  getMetricsSummary,
  type MetricsSummaryDto,
} from "@/shared/api/metrics"

import { toMetricsSummary } from "./adapters"
import type { MetricsSummary, MetricsSummaryFilters } from "./types"

const toDateKey = (value: MetricsSummaryFilters["since"]) => {
  if (!value) return null
  return typeof value === "string"
    ? value
    : value.toISOString().slice(0, 10)
}

const normalize = (values?: string[] | null) =>
  values && values.length ? [...values].sort() : null

const summaryQueryKey = (filters: MetricsSummaryFilters) =>
  [
    "metrics",
    "summary",
    {
      since: toDateKey(filters.since),
      until: toDateKey(filters.until),
      projectId:
        typeof filters.projectId === "number" ? filters.projectId : null,
      repoIds: normalize(filters.repoIds),
      authorIds: normalize(filters.authorIds),
      latestLimit:
        typeof filters.latestLimit === "number" ? filters.latestLimit : null,
    },
  ] as const

export function useMetricsSummary(
  filters: MetricsSummaryFilters,
): UseQueryResult<MetricsSummary> {
  const enabled = Boolean(filters.since && filters.until)

  return useQuery({
    queryKey: summaryQueryKey(filters),
    queryFn: async () => {
      const dto: MetricsSummaryDto = await getMetricsSummary({
        since: filters.since,
        until: filters.until,
        projectId: filters.projectId ?? null,
        repoIds: filters.repoIds ?? null,
        authorIds: filters.authorIds ?? null,
        latestLimit: filters.latestLimit,
      })
      return toMetricsSummary(dto)
    },
    enabled,
    keepPreviousData: true,
    staleTime: 60_000,
    retry: 1,
  })
}
