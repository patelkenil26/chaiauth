"use client";

import { Plus, Blocks, Loader2 } from "lucide-react";
import { IconTile } from "@/shared/components/IconTile";
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
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ca-fade-up">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Each app gets a client ID, an exact callback URL allowlist and its own API keys.
        </p>
        <button className="ca-btn ca-btn-primary shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create application
        </button>
      </div>

      <div className="ca-stagger mt-6 space-y-4">
        {apps.length === 0 ? (
          <div className="ca-glass border border-dashed p-12 text-center">
            <IconTile>
              <Blocks className="h-5 w-5" />
            </IconTile>
            <h2 className="mt-5 text-lg font-semibold text-foreground">No applications yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first OAuth client to add &quot;Sign in with ChaiAuth&quot; to an app.
            </p>
            <button className="ca-btn ca-btn-primary mt-6" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Create application
            </button>
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
