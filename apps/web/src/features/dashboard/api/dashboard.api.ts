import { apiClient } from "@/shared/lib/apiClient";

export const dashboardApi = {
  getMe: async () => {
    return apiClient.get("/auth/me");
  },
  updatePassword: async (data: { oldPassword: string; newPassword: string }) => {
    return apiClient.put("/auth/update-password", data);
  }
};
