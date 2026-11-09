import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

interface UseLogoutOptions {
  onSettled?: () => void;
}

export function useLogout(options?: UseLogoutOptions) {
  return useMutation({
    mutationFn: async () => {
      return await authApi.logout();
    },
    onSettled: () => {
      options?.onSettled?.();
    }
  });
}
