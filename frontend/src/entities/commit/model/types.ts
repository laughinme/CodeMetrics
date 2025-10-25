export type Commit = {
  sha: string;
  repoName: string;
  projectKey: string;
  authorName: string;
  authorEmail: string;
  committerName: string;
  committerEmail: string;
  committedAt: Date;
  message: string;
  isMerge: boolean;
  added: number;
  deleted: number;
  filesChanged: number;
};

export type CommitPage = {
  items: Commit[];
  nextCursor: string | null;
}