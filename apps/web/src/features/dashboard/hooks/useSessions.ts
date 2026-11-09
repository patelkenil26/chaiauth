import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/auth.api";
import { toast } from "sonner";

export interface Session {
  id: string;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  device: string | null;
  ip: string | null;
  city: string | null;
  country: string | null;
  isActive: boolean;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export function useSessions() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await authApi.getSessions() as any;
      let s = res.data?.data || res.data;
      if (!Array.isArray(s)) return [];
      s.sort((a: Session, b: Session) => (a.isCurrent === b.isCurrent ? 0 : a.isCurrent ? -1 : 1));
      return s;
    },
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const revokeOne = useMutation({
    mutationFn: async (id: string) => {
      setRevokingId(id);
      return authApi.revokeSession(id);
    },
    onSuccess: (_, id) => {
      toast.success("Session revoked");
      queryClient.setQueryData(["sessions"], (old: Session[] = []) =>
        old.filter((s) => s.id !== id)
      );
      setRevokingId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revoke session");
      setRevokingId(null);
    },
  });

  const revokeAll = useMutation({
    mutationFn: authApi.revokeAllSessions,
    onSuccess: () => {
      toast.success("All sessions revoked — logging out...");
      setTimeout(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        queryClient.clear();
        router.push("/login");
      }, 1000);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revoke sessions");
    },
  });

  const currentSession = sessions?.find(s => s.isCurrent) || sessions?.[0];
  const currentSessionId = currentSession?.id ?? null;
  const otherSessions = sessions?.filter(s => s.id !== currentSessionId) ?? [];

  return {
    sessions,
    isLoading,
    revokeOne,
    revokeAll,
    revokingId,
    currentSession,
    otherSessions,
  };
}
