import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export function useVerifyEmail(token: string | null) {
  return useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      await authApi.verifyEmail(token);
      return true;
    },
    enabled: !!token,
    retry: false
  });
}
