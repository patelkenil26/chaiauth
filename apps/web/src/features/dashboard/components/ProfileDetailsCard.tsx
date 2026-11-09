import React from "react";
import { BadgeCheck, Clock } from "lucide-react";
import { initialsOf } from "@/shared/layouts/DashboardLayoutClient";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date | string;
}

/** Account hero: who is signed in, at a glance. */
export function ProfileDetailsCard({ user }: { user: UserProfile }) {
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  return (
    <section className="ca-glass relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[var(--chai-mid)]/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <span className="ca-avatar h-20 w-20 text-2xl">{initialsOf(user.name)}</span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="truncate text-2xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
              {user.name}
            </h2>
            {user.isVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-good/25 bg-good/10 px-2.5 py-1 text-xs font-medium text-good">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-[var(--chai-soft)]">
                <Clock className="h-3.5 w-3.5" /> Pending verification
              </span>
            )}
          </div>
          <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>

          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Account type</dt>
              <dd className="mt-0.5 font-medium capitalize text-text-soft">{user.role}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Member since</dt>
              <dd className="mt-0.5 font-medium text-text-soft">{memberSince}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
