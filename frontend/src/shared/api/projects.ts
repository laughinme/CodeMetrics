import apiProtected from "./axiosInstance";

export type ProjectDto = {
    id: number,
    name: string,
    description?: string | null,
    is_public: boolean,
    repo_count: number,
    last_activity_at: string
}

export async function getProjects() {
    const res = await apiProtected.get<ProjectDto[]>('/entities/projects/');
    return res.data;
}

export type ProjectDetailsDto = {
  id: number;
  name: string;
  full_name: string;
  description?: string | null;
  is_public: boolean;
  repo_count: number;
  last_activity_at: string;
};

export type ProjectDetailDto = {
  id: number;
  name: string;
  description?: string | null;
  is_public: boolean;
  repo_count: number;
  last_activity_at: string;
};

export async function getProjectDetails(projectId: number | string) {
    const res = await apiProtected.get<ProjectDetailDto>(
        `/entities/projects/${projectId}/`
    );
    return res.data;
}


