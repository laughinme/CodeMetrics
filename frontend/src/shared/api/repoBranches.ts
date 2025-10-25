import apiProtected from "./axiosInstance";

export type RepoBranchDto = {
  id: string;
  name: string;
  is_default: boolean;
  is_protected: boolean;
  latest_commit?:
    | {
        sha: string;
        message: string;
        committed_at: string;
        author: {
          name: string;
          email: string;
        };
      }
    | null;
};

export type RepoBranchesPageDto = {
  items: RepoBranchDto[];
  next_cursor: string | null;
};

export type RepoBranchesParams = {
  limit?: number;
  cursor?: string | null;
};

export async function getRepoBranches(
  repoId: string,
  { limit = 50, cursor }: RepoBranchesParams = {}
) {
  const { data } = await apiProtected.get<RepoBranchesPageDto>(
    `/entities/repos/${repoId}/branches`,
    {
      params: {
        limit,
        cursor: cursor ?? undefined,
      },
    }
  );
  return data;
}
