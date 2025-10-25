import apiProtected from "./axiosInstance";

export type RepoBranchDto = {
  name: string;
  is_default: boolean;
  latest_commit: {
    sha: string;
    message: string;
    committed_at: string;
    author: {
      name: string;
      email: string;
    };
  } | null;
};

export async function getRepoBranches(repoId: string) {
  const { data } = await apiProtected.get<RepoBranchDto[]>(
    `/entities/repos/${repoId}/branches`
  );
  return data;
}
