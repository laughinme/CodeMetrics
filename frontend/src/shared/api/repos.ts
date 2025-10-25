import apiProtected from "./axiosInstance";

export type RepoDto = {
  id: string;
  project_id: number;
  name: string;
  default_branch: string;
  description?: string | null;
  updated_at: string;
};

export async function getProjectRepos(projectId: number, signal?: AbortSignal) {
  const res = await apiProtected.get<RepoDto[]>(
    `/entities/projects/${projectId}/repos`,
    { signal }
  );
  return res.data;
}
