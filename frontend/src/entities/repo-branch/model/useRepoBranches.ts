import { useMemo } from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";

import {
  getRepoBranches,
  type RepoBranchesParams,
} from "@/shared/api/repoBranches";
import { toRepoBranchPage } from "./adapters";
import type { RepoBranch, RepoBranchPage } from "./types";

type UseRepoBranchesParams = Omit<RepoBranchesParams, "cursor">;

type RepoBranchesPageParam = string | null | undefined;

type RepoBranchesQueryKey = readonly [
  "repo",
  "branches",
  string | null,
  number | undefined
];

type RepoBranchesInfiniteData = InfiniteData<
  RepoBranchPage,
  RepoBranchesPageParam
>;

type UseRepoBranchesOptions = Omit<
  UseInfiniteQueryOptions<
    RepoBranchPage,
    unknown,
    RepoBranchesInfiniteData,
    RepoBranchesQueryKey,
    RepoBranchesPageParam
  >,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

type UseRepoBranchesResult = UseInfiniteQueryResult<RepoBranchesInfiniteData> & {
  branches: RepoBranch[];
};

const normalizeRepoId = (repoId: string | null | undefined) => {
  if (typeof repoId !== "string") {
    return null;
  }
  const trimmed = repoId.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function useRepoBranches(
  repoId: string | null | undefined,
  params: UseRepoBranchesParams = {},
  options: UseRepoBranchesOptions = {}
): UseRepoBranchesResult {
  const { limit } = params;
  const normalizedRepoId = useMemo(() => normalizeRepoId(repoId), [repoId]);

  const queryKey = useMemo<RepoBranchesQueryKey>(
    () => ["repo", "branches", normalizedRepoId, limit],
    [normalizedRepoId, limit]
  );

  const { enabled: enabledOption, ...restOptions } = options;
  const enabled = (enabledOption ?? true) && normalizedRepoId !== null;

  const query = useInfiniteQuery<
    RepoBranchPage,
    unknown,
    RepoBranchesInfiniteData,
    RepoBranchesQueryKey,
    RepoBranchesPageParam
  >({
    queryKey,
    initialPageParam: undefined,
    enabled,
    queryFn: async ({ pageParam }) => {
      if (!normalizedRepoId) {
        throw new Error("Cannot fetch branches without a repository id.");
      }

      const dto = await getRepoBranches(normalizedRepoId, {
        limit,
        cursor: pageParam ?? null,
      });
      return toRepoBranchPage(dto);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
    ...restOptions,
  });

  const branches =
    query.data?.pages.flatMap((page) => page.items) ?? ([] as RepoBranch[]);

  return {
    ...query,
    branches,
  };
}
