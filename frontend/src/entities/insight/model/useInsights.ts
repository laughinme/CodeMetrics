import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import {
  getInsights,
  type InsightDto,
  type InsightsParams,
} from "@/shared/api/insights"

import { toInsights } from "./adapters"
import type { Insight } from "./types"

const toDateOnly = (value: InsightsParams["since"]) => {
  if (!value) return null
  if (typeof value === "string") return value
  return value.toISOString().slice(0, 10)
}

const normalizeArray = (values?: string[] | null) =>
  values && values.length ? [...values].sort() : null

const queryKeyFromParams = (params: InsightsParams) =>
  [
    "insights",
    {
      authorId: params.authorId ?? null,
      authorIds: normalizeArray(params.authorIds),
      repoIds: normalizeArray(params.repoIds),
      projectId:
        typeof params.projectId === "number" ? params.projectId : null,
      since: toDateOnly(params.since),
      until: toDateOnly(params.until),
    },
  ] as const

export function useInsights(
  params: InsightsParams
): UseQueryResult<Insight[]> {
  const enabled = Boolean(params?.since && params?.until)

  return useQuery({
    queryKey: queryKeyFromParams(params),
    queryFn: () =>
      getInsights(params).then((response: InsightDto[]) => toInsights(response)),
    enabled,
    keepPreviousData: true,
    staleTime: 60_000,
    retry: 1,
  })
}
