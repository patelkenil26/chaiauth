import { apiClient } from "@/shared/lib/apiClient";
import { RegisterFormData } from "../schemas/auth.schema";

export const authApi = {
  register: async (data: RegisterFormData) => {
    return apiClient.post("/auth/register", data);
  },
  verifyEmail: async (token: string) => {
    return apiClient.get(`/auth/verify-email/${token}`);
  },
  login: async (data: any) => {
    return apiClient.post("/auth/login", data);
  },
  logout: async () => {
    return apiClient.post("/auth/logout");
  },
  forgotPassword: async (data: { email: string; captchaToken: string }) => {
    return apiClient.post("/auth/forgot-password", data);
  },
  resetPassword: async (token: string, data: { password: string }) => {
    return apiClient.put(`/auth/reset-password/${token}`, data);
  },
  authorize: async (params: any) => {
    return apiClient.get("/o/authorize", { params });
  },
  authorizeSubmit: async (data: any) => {
    return apiClient.post("/o/authorize", data);
  },
  requestMagicLink: async (data: { email: string; captchaToken: string }) => {
    return apiClient.post("/auth/magic-link", data);
  },
  verifyMagicLink: async (data: { token: string }) => {
    return apiClient.post("/auth/magic-link/verify", data);
  },
  sendOtp: async (data: { email?: string; phone?: string }) => {
    return apiClient.post("/auth/send-otp", data);
  },
  // WebAuthn
  getPasskeyRegistrationOptions: async () => {
    return apiClient.post("/auth/webauthn/register/options");
  },
  verifyPasskeyRegistration: async (data: any) => {
    return apiClient.post("/auth/webauthn/register/verify", data);
  },
  getPasskeyAuthOptions: async (data: { email?: string }) => {
    return apiClient.post("/auth/webauthn/authenticate/options", data);
  },
  verifyPasskeyAuth: async (data: { response: any; sessionToken: string }) => {
    return apiClient.post("/auth/webauthn/authenticate/verify", data);
  },
  // MFA
  generateMfa: async () => {
    return apiClient.post("/auth/mfa/generate");
  },
  verifyMfa: async (data: { code: string }) => {
    return apiClient.post("/auth/mfa/verify", data);
  },
  disableMfa: async (data: { code: string }) => {
    return apiClient.post("/auth/mfa/disable", data);
  },
  mfaLogin: async (data: { mfaToken: string; code: string }) => {
    return apiClient.post("/auth/login/mfa", data);
  },
  // Sessions
  getSessions: async () => {
    return apiClient.get("/auth/sessions");
  },
  revokeSession: async (sessionId: string) => {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  },
  revokeAllSessions: async () => {
    return apiClient.delete("/auth/sessions/all");
  },
  deleteAccount: async () => {
    return apiClient.delete("/auth/me");
  },
  updateProfile: async (data: { name?: string; email?: string }) => {
    return apiClient.put("/auth/me", data);
  },
  requestDataExport: async (data: { password?: string }) => {
    return apiClient.post("/auth/export-data/request", data);
  },
};
