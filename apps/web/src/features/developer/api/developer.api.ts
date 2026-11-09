import { apiClient } from "@/shared/lib/apiClient";
import { env } from "@/config/env";

// NEXT_PUBLIC_OIDC_URL = root server URL (e.g. http://localhost:5000)
// Fallback: strip /api suffix from API URL for backwards compat
const OIDC_BASE = env.NEXT_PUBLIC_OIDC_URL ?? env.NEXT_PUBLIC_API_URL.replace(/\/api$/, "");

export const developerApi = {
  getClients: async () => {
    return apiClient.get(`${OIDC_BASE}/developer/clients`);
  },
  createClient: async (data: { displayName: string; applicationUrl?: string; redirectUri: string; allowedIdps: string[] }) => {
    return apiClient.post(`${OIDC_BASE}/developer/clients`, data);
  },
  deleteClient: async (clientId: string) => {
    return apiClient.delete(`${OIDC_BASE}/developer/clients/${clientId}`);
  },
  getApiKeys: async (clientId: string) => {
    return apiClient.get(`${OIDC_BASE}/developer/clients/${clientId}/api-keys`);
  },
  createApiKey: async (clientId: string, data: { name: string; expiresInDays?: number }) => {
    return apiClient.post(`${OIDC_BASE}/developer/clients/${clientId}/api-keys`, data);
  },
  revokeApiKey: async (clientId: string, keyId: string) => {
    return apiClient.delete(`${OIDC_BASE}/developer/clients/${clientId}/api-keys/${keyId}`);
  },
  updateClient: async (clientId: string, data: { displayName?: string; applicationUrl?: string; redirectUri?: string; allowedIdps?: string[] }) => {
    return apiClient.patch(`${OIDC_BASE}/developer/clients/${clientId}`, data);
  }
};

