import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { OAuthApp } from "../types";
import { developerApi } from "../api/developer.api";
import { useState } from "react";
import { toast } from "sonner";

export function useDeveloperApps() {
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OAuthApp>();
  const [deleteTarget, setDeleteTarget] = useState<OAuthApp>();
  const [secret, setSecret] = useState<{ name: string; value: string }>();

  const query = useQuery({
    queryKey: ['developer-apps'],
    queryFn: async (): Promise<OAuthApp[]> => {
      const res = await developerApi.getClients();
      const clients = res.data?.data || res.data || [];
      return clients.map((c: any) => ({
        id: c.id || c.clientId,
        name: c.clientName || c.displayName || "App",
        clientId: c.clientId,
        applicationUrl: c.applicationUrl || undefined,
        redirectUris: c.redirectUris || (c.redirectUri ? [c.redirectUri] : []),
        allowedIdps: c.allowedIdps || ['email', 'google'],
        createdAt: c.createdAt || new Date().toISOString()
      }));
    },
    meta: {
      errorMessage: "Failed to load applications"
    }
  });

  const createApp = useMutation({
    mutationFn: async ({ name, applicationUrl, uri, allowedIdps }: { name: string; applicationUrl?: string; uri: string; allowedIdps: string[] }) => {
      return await developerApi.createClient({
        displayName: name,
        applicationUrl,
        redirectUri: uri,
        allowedIdps
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-apps'] });
    }
  });

  const deleteApp = useMutation({
    mutationFn: async (clientId: string) => {
      return await developerApi.deleteClient(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-apps'] });
    }
  });

  const updateApp = useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string, data: any }) => {
      return await developerApi.updateClient(clientId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-apps'] });
    }
  });

  const handleCreateApp = async (name: string, applicationUrl: string | undefined, uri: string, allowedIdps: string[]) => {
    try {
      const res = await createApp.mutateAsync({ name, applicationUrl, uri, allowedIdps });
      const newClient = res.data?.data || res.data;
      toast.success("Application created successfully");
      
      if (newClient.clientSecret) {
        setSecret({ name: newClient.clientName || name, value: newClient.clientSecret });
      }
      
      setCreateOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create application");
      throw error;
    }
  };

  const handleDeleteApp = async () => {
    if (!deleteTarget) return;
    try {
      await deleteApp.mutateAsync(deleteTarget.clientId);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(undefined);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete application");
    }
  };

  const handleUpdateApp = async (clientId: string, data: any) => {
    try {
      await updateApp.mutateAsync({ 
        clientId, 
        data: {
          displayName: data.name,
          applicationUrl: data.applicationUrl,
          redirectUri: data.uri,
          allowedIdps: data.allowedIdps
        }
      });
      toast.success("Application updated successfully");
      setEditTarget(undefined);
    } catch (error: any) {
      toast.error(error.message || "Failed to update application");
      throw error;
    }
  };

  return {
    apps: query.data || [],
    isLoading: query.isLoading,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    secret, setSecret,
    handleCreateApp,
    handleUpdateApp,
    handleDeleteApp
  };
}
