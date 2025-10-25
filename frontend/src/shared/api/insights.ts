import apiProtected from "./axiosInstance"

export type InsightDto = {
  id: string
  title: string
  description: string
  severity: string
}

export type InsightsParams = {
  authorId?: string
  since?: string | Date
  until?: string | Date
  projectId?: number | null
  repoIds?: string[] | null
  authorIds?: string[] | null
}

const toDateOnly = (value?: string | Date) => {
  if (!value) return undefined
  return typeof value === "string" ? value : value.toISOString().slice(0, 10)
}

const normalizeArray = (values?: string[] | null) =>
  values && values.length ? values : undefined

const mergeAuthorIds = (
  primary?: string,
  list?: string[] | null,
): string[] | undefined => {
  const result = new Set<string>()
  if (primary) {
    result.add(primary)
  }
  if (list?.length) {
    list.forEach((value) => {
      if (value) {
        result.add(value)
      }
    })
  }
  return result.size ? Array.from(result) : undefined
}

const stripNil = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as T

export async function getInsights(params: InsightsParams) {
  const cleaned = stripNil({
    since: toDateOnly(params.since),
    until: toDateOnly(params.until),
    project_id:
      typeof params.projectId === "number" ? params.projectId : undefined,
    repo_ids: normalizeArray(params.repoIds ?? undefined),
    author_ids: mergeAuthorIds(params.authorId, params.authorIds ?? undefined),
  })

  const { data } = await apiProtected.get<InsightDto[]>("/insights", {
    params: cleaned,
  })

  return data
}
