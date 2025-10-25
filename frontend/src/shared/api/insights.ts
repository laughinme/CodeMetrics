import apiProtected from "./axiosInstance"

export type InsightDto = {
  id: string
  title: string
  description: string
  severity: string
}

export type InsightsParams = {
  author_id?: string
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

const stripNil = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as T

export async function getInsights(params: InsightsParams) {
  const cleaned = stripNil({
    author_id: params.author_id,
    since: toDateOnly(params.since),
    until: toDateOnly(params.until),
    projectId:
      typeof params.projectId === "number" ? params.projectId : undefined,
    repoIds: normalizeArray(params.repoIds ?? undefined),
    authorIds: normalizeArray(params.authorIds ?? undefined),
  })

  const { data } = await apiProtected.get<InsightDto[]>("/insights", {
    params: cleaned,
  })

  return data
}
