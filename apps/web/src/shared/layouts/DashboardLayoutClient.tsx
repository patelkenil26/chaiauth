"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Blocks, BookOpen, LogOut, Menu, X, ShieldCheck, Smartphone, BadgeCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/shared/components/Logo";

import { useLogout } from "@/features/auth/hooks/useLogout";
import { useUserProfile } from "@/features/dashboard/hooks/useUserProfile";

const NAV_GROUPS = [
  {
    label: "Account",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/security", label: "Security", icon: ShieldCheck },
      { href: "/sessions", label: "Sessions", icon: Smartphone },
    ],
  },
  {
    label: "Build",
    items: [
      { href: "/developer", label: "Developer", icon: Blocks },
      { href: "/docs", label: "Documentation", icon: BookOpen },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/security": "Security",
  "/sessions": "Sessions & devices",
  "/developer": "Developer console",
};

export function initialsOf(name?: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : parts[0]!.slice(0, 2);
  return letters.toUpperCase();
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: user } = useUserProfile();

  const logoutMutation = useLogout({
    onSettled: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      toast.success("Signed out successfully");
      window.location.href = "/login";
    },
  });
  const handleSignOut = () => logoutMutation.mutate();

  // Close the mobile drawer on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const displayName: string = user?.name || "Your account";
  const pageTitle = PAGE_TITLES[pathname] ?? "Account";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>

      <nav aria-label="Account navigation" className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="ca-mono px-3 text-[0.65rem] uppercase text-muted-foreground" style={{ letterSpacing: ".16em" }}>
              {group.label}
            </p>
            <div className="mt-2 grid gap-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="ca-nav-link"
                  >
                    <Icon className="h-[1.1rem] w-[1.1rem]" /> {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border/70 p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
          <span className="ca-avatar h-10 w-10 text-sm">{initialsOf(user?.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? " "}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={logoutMutation.isPending}
          className="ca-btn ca-btn-ghost mt-2 w-full !h-10 gap-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="ca-root ca-dash dark min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-40" aria-hidden>
        <div className="ca-aurora">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="ca-grid pointer-events-none fixed inset-0 opacity-70" aria-hidden />

      <div className="relative z-10 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen border-r border-border/70 bg-background/55 backdrop-blur-xl lg:block">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
          <div
            className={`absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
            onClick={() => setOpen(false)}
          />
          <aside
            className={`absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] border-r border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>

        <div className="flex min-h-screen min-w-0 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setOpen(true)}
                  className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-secondary lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="hidden text-muted-foreground sm:inline">Account</span>
                  <span className="hidden text-border sm:inline">/</span>
                  <span className="truncate font-medium text-foreground">{pageTitle}</span>
                </nav>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {user?.isVerified && (
                  <span className="hidden items-center gap-1.5 rounded-full border border-good/25 bg-good/10 px-2.5 py-1 text-xs font-medium text-good sm:inline-flex">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
                <Link href="/docs" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
                  Docs <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <span className="ca-avatar h-9 w-9 text-xs lg:hidden">{initialsOf(user?.name)}</span>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
