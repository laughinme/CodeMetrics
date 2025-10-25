import { useMemo } from "react";
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import { getRepoBranches } from "@/shared/api/repoBranches";
import { toRepoBranch } from "./adapters";
import type { RepoBranch } from "./types";

type UseRepoBranchesOptions = Omit<
  UseQueryOptions<RepoBranch[], unknown, RepoBranch[], RepoBranchesQueryKey>,
  "queryKey" | "queryFn"
>;

type RepoBranchesQueryKey = readonly ["repo", "branches", string | null];

export type UseRepoBranchesResult = UseQueryResult<RepoBranch[]>;

const normalizeRepoId = (repoId: string | null | undefined) => {
  if (typeof repoId !== "string") {
    return null;
  }
  const trimmed = repoId.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function useRepoBranches(
  repoId: string | null | undefined,
  options: UseRepoBranchesOptions = {}
): UseRepoBranchesResult {
  const normalizedRepoId = useMemo(() => normalizeRepoId(repoId), [repoId]);

  const { enabled: enabledOption, ...restOptions } = options;
  const enabled = (enabledOption ?? true) && normalizedRepoId !== null;

  return useQuery<RepoBranch[], unknown, RepoBranch[], RepoBranchesQueryKey>({
    queryKey: ["repo", "branches", normalizedRepoId],
    enabled,
    queryFn: async () => {
      if (!normalizedRepoId) {
        throw new Error("Cannot fetch branches without a repository id.");
      }

      const dto = await getRepoBranches(normalizedRepoId);
      return dto.map(toRepoBranch);
    },
    staleTime: 60_000,
    ...restOptions,
  });
}
