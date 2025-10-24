import { useMemo } from "react";
import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";

import { getProjectDetails } from "@/shared/api/projects";

import { mapProjectDetailDto, toProjectDetailVM } from "./adapters";
import type { ProjectDetail, ProjectDetailVM } from "./types";

type QueryOptions = Omit<UseQueryOptions<ProjectDetail>, "queryKey" | "queryFn">;

type UseProjectDetailsResult = UseQueryResult<ProjectDetail> & {
  view: ProjectDetailVM | undefined;
};

export function useProjectDetails(
  projectId: number | string | null | undefined,
  options: QueryOptions = {}
): UseProjectDetailsResult {
  const id = useMemo(() => {
    if (typeof projectId === "number") {
      return Number.isFinite(projectId) && projectId > 0 ? String(projectId) : null;
    }
    if (typeof projectId === "string") {
      const trimmed = projectId.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  }, [projectId]);

  const { enabled: enabledOption, ...restOptions } = options;
  const enabled = (enabledOption ?? true) && id !== null;

  const query = useQuery<ProjectDetail>({
    queryKey: ["project", "detail", id],
    queryFn: async () => {
      const dto = await getProjectDetails(id as string);
      return mapProjectDetailDto(dto);
    },
    staleTime: 60_000,
    ...restOptions,
    enabled,
  });

  const view = useMemo(
    () => (query.data ? toProjectDetailVM(query.data) : undefined),
    [query.data]
  );

  return {
    ...query,
    view,
  };
}
