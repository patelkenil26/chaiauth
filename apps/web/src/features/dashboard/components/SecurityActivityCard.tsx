"use client";

import React from "react";
import { ShieldCheck, UserCheck, KeyRound } from "lucide-react";
import { useUserProfile } from "../hooks/useUserProfile";
import { format } from "date-fns";

export function SecurityActivityCard() {
  const { data: user } = useUserProfile();

  const mfaStatus = user?.isMfaEnabled 
    ? "Protected by Two-Factor Authentication" 
    : "No two-factor protection enabled";

  const memberSince = user?.createdAt 
    ? format(new Date(user.createdAt), "MMMM d, yyyy") 
    : "Recently";

  return (
    <section className="ca-glass rounded-md p-6">
      <div className="flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
            Security snapshot
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your account protection
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <div className="flex gap-3">
          <KeyRound className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-soft">Authentication level</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mfaStatus}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <UserCheck className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-soft">Account timeline</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active member since {memberSince}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
