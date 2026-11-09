"use client";

import { UserCircle, Loader2 } from "lucide-react";
import { useProfileSettings } from "../hooks/useProfileSettings";

export function ProfileSettingsCard({ user }: { user: any }) {
  const { name, setName, email, setEmail, isDirty, isLoading, handleSubmit } = useProfileSettings(user);

  return (
    <section className="ca-glass rounded-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-primary">
          <UserCircle className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
            Profile Details
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your personal information and email address.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ca-input max-w-md block"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ca-input max-w-md block"
            placeholder="Your email address"
          />
          {user.email !== email && (
            <p className="text-xs text-yellow-600/80">
              Note: Changing your email will require you to verify the new address.
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isDirty || isLoading}
            className="ca-btn ca-btn-primary"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}
