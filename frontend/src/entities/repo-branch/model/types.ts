export type RepoBranch = {
  name: string;
  isDefault: boolean;
  latestCommit: {
    sha: string;
    message: string;
    committedAt: Date;
    authorName: string;
    authorEmail: string;
  } | null;
};
