import apiProtected from "./axiosInstance";

export type ScmIntegration = {
  id: string;
  provider: string;
  external_id?: string | null;
  external_login?: string | null;
  scopes: string[];
  created_at: string;
  updated_at?: string | null;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  last_sync_error?: string | null;
};

export const listIntegrations = async (): Promise<ScmIntegration[]> => {
  const response = await apiProtected.get<ScmIntegration[]>("/integrations/");
  return response.data;
};

export const syncIntegration = async (integrationId: string): Promise<void> => {
  await apiProtected.post(`/integrations/${integrationId}/sync`);
};

export const getGitHubAuthorizeUrl = async (returnTo: string): Promise<string> => {
  const response = await apiProtected.get<{ url: string }>(
    "/integrations/github/authorize-url",
    {
      params: { return_to: returnTo },
    }
  );
  return response.data.url;
};
