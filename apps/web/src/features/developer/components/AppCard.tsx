import React from "react";
import { Blocks, Trash2, Check, Clipboard, ExternalLink } from "lucide-react";
import { useCopy } from "@/shared/hooks/useCopy";
import type { OAuthApp } from "../types";

interface AppCardProps {
  app: OAuthApp;
  onEdit: (app: OAuthApp) => void;
  onDelete: (app: OAuthApp) => void;
}

export function AppCard({ app, onEdit, onDelete }: AppCardProps) {
  const { copied, copy } = useCopy();

  return (
    <article className="ca-glass rounded-md p-5 sm:p-6 transition-all hover:border-primary/20 hover:shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-primary">
            <Blocks className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
                {app.name}
              </h2>
              <span className="rounded-sm border border-border px-1.5 py-0.5 text-[0.65rem] text-good tracking-wider bg-background/50">
                ACTIVE
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Created {new Date(app.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 self-start">
          <button 
            className="ca-btn border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary text-sm px-3 py-1.5 h-auto transition-colors" 
            onClick={() => onEdit(app)}
          >
            Edit
          </button>
          <button 
            className="ca-btn border border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive text-sm px-3 py-1.5 h-auto transition-colors" 
            onClick={() => onDelete(app)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
          </button>
        </div>
      </div>
      
      <dl className="mt-5 grid gap-4 border-t border-border/50 pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground mb-1">Client ID</dt>
          <dd className="flex min-w-0 items-center gap-2">
            <code className="ca-mono min-w-0 truncate text-sm text-text-soft bg-accent/50 px-2 py-0.5 rounded border border-border/50">
              {app.clientId}
            </code>
            <button aria-label="Copy client ID" title="Copy client ID" className="shrink-0 text-muted-foreground hover:text-primary transition-colors" onClick={() => copy(app.clientId, "Client ID")}>
              {copied === app.clientId ? <Check className="h-4 w-4 text-good" /> : <Clipboard className="h-4 w-4" />}
            </button>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground mb-1">Redirect URI</dt>
          <dd className="flex min-w-0 items-center gap-2">
            <code className="ca-mono min-w-0 truncate text-sm text-text-soft bg-accent/50 px-2 py-0.5 rounded border border-border/50">
              {app.redirectUris[0]}
            </code>
            <a href={app.redirectUris[0]} target="_blank" rel="noreferrer" className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-border/50 pt-5">
        <p className="text-xs text-muted-foreground mb-3">Allowed Sign-in Methods</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "email", label: "Email & Password" },
            { id: "google", label: "Google" },
            { id: "github", label: "GitHub" },
            { id: "phone", label: "Phone (OTP)" },
            { id: "username", label: "Username" },
          ].map((idp) => {
            const isChecked = app.allowedIdps?.includes(idp.id) || false;
            if (!isChecked) return null;
            
            return (
              <span key={idp.id} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                <Check className="h-3 w-3 mr-1" />
                {idp.label}
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}
