import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import apiProtected from "./axiosInstance"

export type SyncStatusDto = {
  in_progress: boolean
  phase: string | null
  started_at: string | null
  finished_at: string | null
  last_error: string | null
  progress: number | null
}

export type SyncStatus = {
  inProgress: boolean
  phase: string | null
  startedAt: Date | null
  finishedAt: Date | null
  lastError: string | null
  progress: number | null
}

export async function getSyncStatus(): Promise<SyncStatusDto> {
  const { data } = await apiProtected.get<SyncStatusDto>("/status/sync")
  return data
}

const adaptSyncStatus = (dto: SyncStatusDto): SyncStatus => ({
  inProgress: dto.in_progress,
  phase: dto.phase,
  startedAt: dto.started_at ? new Date(dto.started_at) : null,
  finishedAt: dto.finished_at ? new Date(dto.finished_at) : null,
  lastError: dto.last_error,
  progress: dto.progress,
})

export function useSyncStatus(
  refetchInterval = 5000,
): UseQueryResult<SyncStatus> {
  return useQuery({
    queryKey: ["sync-status"],
    queryFn: async () => adaptSyncStatus(await getSyncStatus()),
    refetchInterval,
    staleTime: refetchInterval,
  })
}
