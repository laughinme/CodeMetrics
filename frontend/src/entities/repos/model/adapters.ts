import type { RepoDto } from "@/shared/api/repos";
import type { Repo } from "./types";

export const mapRepoDto = (d: RepoDto): Repo => ({
  id: d.id,
  projectId: d.project_id,
  name: d.name,
  defaultBranch: d.default_branch,
  description: d.description ?? null,
  updatedAt: new Date(d.updated_at),
});

export const mapReposDto = (arr: RepoDto[]): Repo[] => arr.map(mapRepoDto);