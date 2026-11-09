import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { developerApi } from "../api/developer.api";
import type { ApiKey } from "../types";

/** API keys of one application. Loads only while `enabled` (i.e. the panel is open). */
export function useApiKeys(clientId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const queryKey = ["developer-api-keys", clientId];
  // Shown once in a dialog right after creation; the server never returns it again
  const [createdKey, setCreatedKey] = useState<{ name: string; value: string }>();

  const query = useQuery({
    queryKey,
    enabled,
    queryFn: async (): Promise<ApiKey[]> => {
      const res = await developerApi.getApiKeys(clientId);
      return res.data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: (input: { name: string; expiresInDays?: number }) => developerApi.createApiKey(clientId, input),
    onSuccess: (res, input) => {
      setCreatedKey({ name: input.name, value: res.data.key });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create API key"),
  });

  const revoke = useMutation({
    mutationFn: (keyId: string) => developerApi.revokeApiKey(clientId, keyId),
    onSuccess: () => {
      toast.success("API key revoked");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to revoke API key"),
  });

  return {
    keys: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createKey: (input: { name: string; expiresInDays?: number }) => create.mutateAsync(input),
    isCreating: create.isPending,
    revokeKey: (keyId: string) => revoke.mutate(keyId),
    revokingId: revoke.isPending ? revoke.variables : undefined,
    createdKey,
    dismissCreatedKey: () => setCreatedKey(undefined),
  };
}
