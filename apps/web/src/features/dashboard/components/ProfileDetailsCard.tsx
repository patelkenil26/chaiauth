import React from "react";
import { CheckCircle2, User } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}

interface ProfileDetailsCardProps {
  user: UserProfile;
}

export function ProfileDetailsCard({ user }: ProfileDetailsCardProps) {
  return (
    <section className="ca-glass rounded-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-primary">
            <User className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <h2 className="font-display text-xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
              {user.name}
            </h2>
          </div>
        </div>
        <span className={user.isVerified ? "flex items-center gap-1.5 text-sm text-good" : "text-sm text-primary"}>
          {user.isVerified && <CheckCircle2 className="h-4 w-4" />}
          {user.isVerified ? "Verified" : "Pending verification"}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd className="mt-1 break-all text-sm font-medium text-text-soft">{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Account type</dt>
          <dd className="mt-1 text-sm capitalize font-medium text-text-soft">{user.role}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Member since</dt>
          <dd className="mt-1 text-sm font-medium text-text-soft">
            {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </dd>
        </div>
      </dl>
    </section>
  );
}
