import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import {
  getMetricsTimelineSummary,
  type MetricsTimelineSummaryDto,
} from "@/shared/api/metrics"

import { toMetricsTimelineSummary } from "./adapters"
import type {
  MetricsTimelineFilters,
  MetricsTimelineSummary,
} from "./types"

const toDateKey = (value: MetricsTimelineFilters["since"]) => {
  if (!value) return null
  return typeof value === "string"
    ? value
    : value.toISOString().slice(0, 10)
}

const normalize = (values?: string[] | null) =>
  values && values.length ? [...values].sort() : null

const timelineQueryKey = (filters: MetricsTimelineFilters) =>
  [
    "metrics",
    "timeline",
    {
      since: toDateKey(filters.since),
      until: toDateKey(filters.until),
      projectId:
        typeof filters.projectId === "number" ? filters.projectId : null,
      repoIds: normalize(filters.repoIds),
      authorIds: normalize(filters.authorIds),
    },
  ] as const

export function useMetricsTimelineSummary(
  filters: MetricsTimelineFilters,
): UseQueryResult<MetricsTimelineSummary> {
  const enabled = Boolean(filters.since && filters.until)

  return useQuery({
    queryKey: timelineQueryKey(filters),
    queryFn: async () => {
      const dto: MetricsTimelineSummaryDto =
        await getMetricsTimelineSummary({
          since: filters.since,
          until: filters.until,
          projectId: filters.projectId ?? null,
          repoIds: filters.repoIds ?? null,
          authorIds: filters.authorIds ?? null,
        })

      return toMetricsTimelineSummary(dto)
    },
    enabled,
    keepPreviousData: true,
    staleTime: 60_000,
    retry: 1,
  })
}
