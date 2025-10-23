import apiProtected from "./axiosInstance";

export type ReposCommits = {

}

export async function getReposCommits(project_key:string, repo: string, cursor: string) {
    const res = await apiProtected.get<ReposCommits>(`/entities/repos/${project_key}/${repo}/commits,`);
    return res.data;
}

export type ReposBranchs = {

}

export async function getReposBranches(project_key:string, repo: string, cursor: string) {
    const res = await apiProtected.get<ReposBranchs>(`/entities/repos/${project_key}/${repo}/branches`)
    return res.data;
}

