"use client";

import React from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Loader2,
  ShieldAlert,
  Wifi,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useSessions, Session } from "../hooks/useSessions";
import { IconTile } from "@/shared/components/IconTile";

function DeviceIcon({ device }: { device: string | null }) {
  const cls = "h-5 w-5 text-primary";
  if (device === "Mobile") return <Smartphone className={cls} />;
  if (device === "Tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

function SessionRow({
  session,
  isCurrentSession,
  onRevoke,
  isRevoking,
}: {
  session: Session;
  isCurrentSession: boolean;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}) {
  const lastSeen = formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true });
  const location = [session.city, session.country].filter(Boolean).join(", ") || session.ip || "Unknown location";

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 border border-border/40 hover:border-border/70 transition-all group">
      {/* Device icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
        <DeviceIcon device={session.device} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">
            {session.browser || "Unknown Browser"} {session.browserVersion || ""}
          </p>
          {isCurrentSession && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-green-500/15 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Current session
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{session.os || "Unknown OS"}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3" />
            {location}
          </span>
          <span className="text-xs text-muted-foreground">· {lastSeen}</span>
        </div>
      </div>

      {/* Revoke button */}
      {!isCurrentSession && (
        <button
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
          className="shrink-0 opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-red-400 flex items-center gap-1 transition-all px-2 py-1 rounded-md hover:bg-red-500/10 disabled:opacity-50"
        >
          {isRevoking ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
          Revoke
        </button>
      )}
    </div>
  );
}

export function SessionsCard() {
  const {
    sessions,
    isLoading,
    revokeOne,
    revokeAll,
    revokingId,
    otherSessions,
  } = useSessions();

  return (
    <section className="ca-glass rounded-md p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <IconTile>
            <ShieldAlert className="h-5 w-5" />
          </IconTile>
          <div>
            <h2
              className="font-display text-lg font-semibold text-foreground"
              style={{ fontFamily: '"Sora", sans-serif' }}
            >
              Active sessions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Devices currently signed in to your account
            </p>
          </div>
        </div>

        {otherSessions.length > 0 && (
          <button
            onClick={() => revokeAll.mutate()}
            disabled={revokeAll.isPending}
            className="shrink-0 text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            {revokeAll.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <LogOut className="h-3 w-3" />
            )}
            Log out all devices
          </button>
        )}
      </div>

      {/* Sessions list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No active sessions found. Log in to see your devices here.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Current session first */}
          {sessions[0] && (
            <SessionRow
              session={sessions[0]}
              isCurrentSession={true}
              onRevoke={(id) => revokeOne.mutate(id)}
              isRevoking={revokingId === sessions[0].id && revokeOne.isPending}
            />
          )}

          {/* Divider if there are other sessions */}
          {otherSessions.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-xs text-muted-foreground">Other sessions</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
          )}

          {otherSessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              isCurrentSession={false}
              onRevoke={(id) => revokeOne.mutate(id)}
              isRevoking={revokingId === session.id && revokeOne.isPending}
            />
          ))}
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <p className="text-xs text-muted-foreground pt-1">
          Hover over a session to see the revoke option. Revoking a session will sign out that device immediately.
        </p>
      )}
    </section>
  );
}
