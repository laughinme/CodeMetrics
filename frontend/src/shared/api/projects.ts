import apiProtected from "./axiosInstance";

export type Projects = {

}

export async function getProjects(params:type) {
    const res = await apiProtected.get<Projects>('/entities/projects/');
    return res.data;
}

export type ProjectDetails = {

}

export async function getProjectDetails(project_key:string) {
    const res = await apiProtected.get<ProjectDetails>(`/entities/projects/${project_key}`);
    return res.data;
}

export type ProjectRepos = {

}

export async function getProjectRepos(project_key:string, cursor: string) {
    const res = await apiProtected.get<ProjectRepos>(`/entities/projects/${project_key}/repos`);
    return res.data;
}

