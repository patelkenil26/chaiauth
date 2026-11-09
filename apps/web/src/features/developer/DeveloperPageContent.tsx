"use client";

import { Plus, Blocks, Loader2 } from "lucide-react";
import { AppCard } from "./components/AppCard";
import { CreateAppModal } from "./components/CreateAppModal";
import { EditAppModal } from "./components/EditAppModal";
import { SecretModal } from "./components/SecretModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

import { useDeveloperApps } from "./hooks/useDeveloperApps";

export function DeveloperPageContent() {
  const { 
    apps, isLoading, 
    createOpen, setCreateOpen, 
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget, 
    secret, setSecret, 
    handleCreateApp, handleUpdateApp, handleDeleteApp
  } = useDeveloperApps();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ca-fade-up">
        <div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Register apps that use ChaiAuth for sign-in. Each app gets a client ID and exact callback URL allowlist.
          </p>
        </div>
        <button className="ca-btn ca-btn-primary shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create application
        </button>
      </div>

      <div className="mt-8 space-y-3 ca-fade-up">
        {apps.length === 0 ? (
          <div className="ca-glass rounded-md border border-dashed border-border p-10 text-center">
            <Blocks className="mx-auto h-6 w-6 text-muted-foreground" />
            <h2 className="mt-4 font-semibold text-foreground">No applications yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create your first OAuth client to begin.</p>
          </div>
        ) : (
          apps.map((app) => (
            <AppCard 
              key={app.id} 
              app={app} 
              onEdit={setEditTarget}
              onDelete={setDeleteTarget} 
            />
          ))
        )}
      </div>

      {createOpen && (
        <CreateAppModal 
          onClose={() => setCreateOpen(false)} 
          onCreate={handleCreateApp} 
        />
      )}

      {editTarget && (
        <EditAppModal 
          app={editTarget}
          onClose={() => setEditTarget(undefined)} 
          onUpdate={handleUpdateApp} 
        />
      )}

      {secret && (
        <SecretModal 
          secret={secret} 
          onClose={() => setSecret(undefined)} 
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal 
          app={deleteTarget} 
          onClose={() => setDeleteTarget(undefined)} 
          onConfirm={handleDeleteApp} 
        />
      )}
    </div>
  );
}
