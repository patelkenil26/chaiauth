"use client";

import React, { useId, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { useApiKeys } from "../hooks/useApiKeys";
import { SecretModal } from "./SecretModal";
import type { ApiKey, ApiKeyStatus } from "../types";

const EXPIRY_OPTIONS = [
  { label: "Never expires", value: "" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "1 year", value: "365" },
];

const STATUS_STYLE: Record<ApiKeyStatus, string> = {
  active: "text-good",
  expired: "text-muted-foreground",
  revoked: "text-destructive",
};

const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN") : null);

function KeyRow({ apiKey, onRevoke, revoking }: { apiKey: ApiKey; onRevoke: () => void; revoking: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const live = apiKey.status === "active";

  return (
    <li className="flex flex-col gap-3 rounded-md border border-border/60 bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{apiKey.name}</span>
          <span className={`text-[0.65rem] font-semibold uppercase tracking-wider ${STATUS_STYLE[apiKey.status]}`}>
            {apiKey.status}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          <code className="ca-mono text-text-soft">{apiKey.keyPrefix}…</code>
          {" · "}Created {formatDate(apiKey.createdAt)}
          {" · "}
          {apiKey.lastUsedAt ? `Last used ${formatDate(apiKey.lastUsedAt)}` : "Never used"}
          {apiKey.expiresAt && ` · ${live ? "Expires" : "Expired"} ${formatDate(apiKey.expiresAt)}`}
        </p>
      </div>

      {live &&
        (confirming ? (
          <div className="flex shrink-0 items-center gap-2 text-xs">
            <span className="text-muted-foreground">Revoke for good?</span>
            <button
              type="button"
              disabled={revoking}
              onClick={onRevoke}
              className="rounded-md border border-destructive/50 px-2.5 py-1 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              {revoking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, revoke"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="px-1 text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-destructive/40 px-2.5 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10 sm:self-auto"
          >
            <Trash2 className="h-3 w-3" /> Revoke
          </button>
        ))}
    </li>
  );
}

/** Server-to-server API keys of one application: list, create (shown once) and revoke. */
export function ApiKeysPanel({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const nameId = useId();
  const expiryId = useId();
  const panelId = useId();

  const { keys, isLoading, isError, createKey, isCreating, revokeKey, revokingId, createdKey, dismissCreatedKey } =
    useApiKeys(clientId, open);

  const trimmed = name.trim();
  const canCreate = trimmed.length >= 3 && !isCreating;

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    try {
      await createKey({ name: trimmed, ...(expiry && { expiresInDays: Number(expiry) }) });
      setName("");
      setExpiry("");
    } catch {
      // the hook already showed the error toast
    }
  };

  return (
    <div className="mt-5 border-t border-border/50 pt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <KeyRound className="h-4 w-4 text-primary" /> API keys
          <span className="text-xs font-normal text-muted-foreground">for server-to-server calls</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div id={panelId} className="mt-4 space-y-4 ca-fade-up">
          <p className="text-xs leading-5 text-muted-foreground">
            Use a key as <code className="ca-mono text-text-soft">Authorization: Bearer ca_live_…</code> to read the users who
            granted this app access (<code className="ca-mono text-text-soft">GET /v1/users</code>). Keep keys on your server.
          </p>

          <form onSubmit={onCreate} className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor={nameId} className="mb-1.5 block text-xs font-medium text-text-soft">
                Key name
              </label>
              <input
                id={nameId}
                className="ca-input !h-10"
                placeholder="e.g. Production backend"
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={expiryId} className="mb-1.5 block text-xs font-medium text-text-soft">
                Expiry
              </label>
              <select id={expiryId} className="ca-input !h-10 sm:w-40" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                {EXPIRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={!canCreate} className="ca-btn ca-btn-primary !h-10 shrink-0">
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create key
            </button>
          </form>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">Could not load API keys. Try closing and reopening this section.</p>
          ) : keys.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No API keys yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {keys.map((k) => (
                <KeyRow key={k.id} apiKey={k} onRevoke={() => revokeKey(k.id)} revoking={revokingId === k.id} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Portal: the card has a backdrop-filter, which would trap a position:fixed dialog inside it */}
      {createdKey &&
        createPortal(<SecretModal secret={createdKey} kind="API key" onClose={dismissCreatedKey} />, document.body)}
    </div>
  );
}
