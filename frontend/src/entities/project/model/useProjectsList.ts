import { useQuery } from "@tanstack/react-query"

import { getProjects } from "@/shared/api/projects"

import { dtoListToCardVM } from "./adapters"
import type { Project } from "./types"

const QUERY_KEY = ["projects", "cards"] as const

export function useProjectCardsList() {
  return useQuery<Project[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => dtoListToCardVM(await getProjects()),
    staleTime: 60_000,
  })
}
