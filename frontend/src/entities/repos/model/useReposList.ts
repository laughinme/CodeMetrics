import { useEffect, useState } from "react";

import { getProjectRepos } from "@/shared/api/repos";

import { mapReposDto } from "./adapters";
import type { Repo } from "./types";

type Options = { enabled?: boolean };

const isCanceledError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: unknown; message?: unknown; name?: unknown };
  return (
    maybeError.code === "ERR_CANCELED" ||
    maybeError.name === "CanceledError" ||
    maybeError.message === "canceled"
  );
};

export function useReposList(projectId: number | null | undefined, options: Options = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<Repo[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const canFetch = enabled && typeof projectId === "number";

  const fetcher = async (signal?: AbortSignal) => {
    const raw = await getProjectRepos(projectId as number, signal);
    return mapReposDto(raw);
  };

  const handleError = (e: unknown) => {
    if (isCanceledError(e)) {
      return;
    }
    setError(e);
  };

  const refetch = async () => {
    if (!canFetch) return;
    setIsLoading(true);
    setError(undefined);
    try {
      setData(await fetcher());
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    if (canFetch) {
      setIsLoading(true);
      setError(undefined);
      fetcher(ac.signal)
        .then(setData)
        .catch(handleError)
        .finally(() => setIsLoading(false));
    } else {
      setData(undefined);
    }
    return () => ac.abort();
  }, [projectId, enabled]);

  return { data, isLoading, error, refetch };
}
