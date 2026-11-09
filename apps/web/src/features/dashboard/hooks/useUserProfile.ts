import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await dashboardApi.getMe();
      if (res.data) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(res.data));
        }
        return res.data;
      }
      throw new Error("No user data");
    },
  });
}
