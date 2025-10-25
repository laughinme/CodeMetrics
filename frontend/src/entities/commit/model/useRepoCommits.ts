import { useMemo } from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";

import {
  getRepoCommits,
  type RepoCommitsParams,
} from "@/shared/api/repoCommits";
import { toCommitPage } from "./adapters";
import type { Commit, CommitPage } from "./types";

type UseRepoCommitsParams = Omit<RepoCommitsParams, "cursor">;

type RepoCommitsPageParam = string | null | undefined;

type RepoCommitsQueryKey = readonly [
  "repo",
  "commits",
  string | null,
  number | undefined,
  string | null
];

type RepoCommitsInfiniteData = InfiniteData<CommitPage, RepoCommitsPageParam>;

type UseRepoCommitsOptions = Omit<
  UseInfiniteQueryOptions<
    CommitPage,
    unknown,
    RepoCommitsInfiniteData,
    RepoCommitsQueryKey,
    RepoCommitsPageParam
  >,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

type UseRepoCommitsResult = UseInfiniteQueryResult<RepoCommitsInfiniteData> & {
  commits: Commit[];
};

const normalizeRepoId = (repoId: string | null | undefined) => {
  if (typeof repoId !== "string") {
    return null;
  }
  const trimmed = repoId.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeAfterForKey = (after: UseRepoCommitsParams["after"]) => {
  if (!after) {
    return null;
  }
  return typeof after === "string" ? after : after.toISOString();
};

export function useRepoCommits(
  repoId: string | null | undefined,
  params: UseRepoCommitsParams = {},
  options: UseRepoCommitsOptions = {}
): UseRepoCommitsResult {
  const { limit, after } = params;

  const normalizedRepoId = useMemo(() => normalizeRepoId(repoId), [repoId]);
  const afterKey = useMemo(() => normalizeAfterForKey(after), [after]);
  const queryKey = useMemo<RepoCommitsQueryKey>(
    () => ["repo", "commits", normalizedRepoId, limit, afterKey],
    [normalizedRepoId, limit, afterKey]
  );

  const { enabled: enabledOption, ...restOptions } = options;
  const enabled = (enabledOption ?? true) && normalizedRepoId !== null;

  const query = useInfiniteQuery<
    CommitPage,
    unknown,
    RepoCommitsInfiniteData,
    RepoCommitsQueryKey,
    RepoCommitsPageParam
  >({
    queryKey,
    initialPageParam: undefined,
    enabled,
    queryFn: async ({ pageParam }) => {
      if (!normalizedRepoId) {
        throw new Error("Cannot fetch commits without a repository id.");
      }
      const dto = await getRepoCommits(normalizedRepoId, {
        limit,
        after,
        cursor: pageParam ?? null,
      });
      return toCommitPage(dto);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    ...restOptions,
  });

  const commits = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  return{
    ...query,
    commits,
  };
}
