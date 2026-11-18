"use client";

export function AuthDivider({ children = "or" }: { children?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Small "Last used" marker pinned to the corner of a sign-in button. */
export function LastUsedBadge() {
  return (
    <span className="pointer-events-none absolute -top-2 right-2 rounded-full border border-primary/30 bg-background px-1.5 py-px text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
      Last used
    </span>
  );
}

export function SocialButtons({
  onGoogle,
  onGithub,
  lastUsed,
}: {
  onGoogle: () => void;
  onGithub: () => void;
  lastUsed?: "google" | "github" | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button type="button" onClick={onGoogle} className="ca-btn ca-btn-ghost relative !overflow-visible">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8Z" />
          <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.6-2.8Z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4Z" />
        </svg>
        Google
        {lastUsed === "google" && <LastUsedBadge />}
      </button>
      <button type="button" onClick={onGithub} className="ca-btn ca-btn-ghost relative !overflow-visible">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
        GitHub
        {lastUsed === "github" && <LastUsedBadge />}
      </button>
    </div>
  );
}
