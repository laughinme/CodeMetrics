export type RepoBranch = {
  id: string;
  name: string;
  isDefault: boolean;
  isProtected: boolean;
  latestCommit:
    | {
        sha: string;
        message: string;
        committedAt: Date;
        authorName: string;
        authorEmail: string;
      }
    | null;
};

export type RepoBranchPage = {
  items: RepoBranch[];
  nextCursor: string | null;
};
