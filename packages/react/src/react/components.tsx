import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useChaiAuth } from "./provider";
import { useChaiAuthStyles } from "./styles";

/** Renders its children only when a user is signed in. */
export function SignedIn({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useChaiAuth();
  return isAuthenticated ? <>{children}</> : null;
}

/** Renders its children only when nobody is signed in (not while the session is still loading). */
export function SignedOut({ children }: { children: ReactNode }) {
  const { status } = useChaiAuth();
  return status === "unauthenticated" ? <>{children}</> : null;
}

export interface SignInProps {
  children?: ReactNode;
  className?: string;
  /** Path on your site to return to after signing in, e.g. `/dashboard`. */
  returnTo?: string;
}

/** "Sign in with ChaiAuth" button. */
export function SignIn({ children = "Sign in with ChaiAuth", className, returnTo }: SignInProps) {
  useChaiAuthStyles();
  const { signIn, isLoading, error } = useChaiAuth();

  return (
    <>
      <button
        type="button"
        className={className ?? "chaiauth-btn"}
        disabled={isLoading}
        onClick={() => void signIn({ returnTo })}
      >
        {children}
      </button>
      {error && (
        <p role="alert" style={{ margin: ".5rem 0 0", color: "#dc2626", fontSize: ".85rem" }}>
          {error}
        </p>
      )}
    </>
  );
}

const initialsOf = (name?: string, email?: string): string => {
  const source = (name?.trim() || email?.split("@")[0] || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : source.slice(0, 2);
  return letters.toUpperCase();
};

export interface UserButtonProps {
  /** Adds a "Manage account" link, e.g. your ChaiAuth dashboard URL. */
  accountUrl?: string;
  /** Where to go after signing out. Defaults to staying on the page. */
  afterSignOutUrl?: string;
}

/** Avatar with a menu showing the signed-in user and a sign-out action. Renders nothing when signed out. */
export function UserButton({ accountUrl, afterSignOutUrl }: UserButtonProps) {
  useChaiAuthStyles();
  const { user, isAuthenticated, signOut } = useChaiAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!isAuthenticated || !user) return null;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    if (afterSignOutUrl) window.location.assign(afterSignOutUrl);
  };

  return (
    <div className="chaiauth-user" ref={rootRef}>
      <button
        type="button"
        className="chaiauth-avatar"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {initialsOf(user.name, user.email)}
      </button>

      {open && (
        <div id={menuId} role="menu" className="chaiauth-menu">
          <div className="chaiauth-head">
            {user.name && <div className="chaiauth-name">{user.name}</div>}
            {user.email && <div className="chaiauth-email">{user.email}</div>}
          </div>
          {accountUrl && (
            <a role="menuitem" className="chaiauth-item" href={accountUrl} target="_blank" rel="noreferrer">
              Manage account
            </a>
          )}
          <button type="button" role="menuitem" className="chaiauth-item" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
