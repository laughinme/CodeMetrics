export type Repo = {
  id: string; 
  projectId: number; 
  name: string; 
  defaultBranch: string;
  description: string|null; 
  updatedAt: Date;
};

