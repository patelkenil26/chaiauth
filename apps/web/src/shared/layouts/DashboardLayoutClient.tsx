"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Blocks, BookOpen, LogOut, Menu, X, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/shared/components/Logo";

import { useLogout } from "@/features/auth/hooks/useLogout";
import { authApi } from "@/features/auth/api/auth.api";

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {}
    }
  }, []);

  const items = [
    { href: "/dashboard", label: "Profile", icon: LayoutDashboard },
    { href: "/security", label: "Security", icon: ShieldCheck },
    { href: "/sessions", label: "Sessions", icon: Smartphone },
    { href: "/developer", label: "Developer", icon: Blocks },
    { href: "/docs", label: "Documentation", icon: BookOpen },
  ];

  const logoutMutation = useLogout({
    onSettled: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      toast.success("Signed out successfully");
      window.location.href = "/login";
    }
  });

  const handleSignOut = () => logoutMutation.mutate();

  const displayName = user?.name || "User";

  return (
    <div className="ca-root dark min-h-screen">
      <div className="ca-grid pointer-events-none fixed inset-0" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-1 rounded-md text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-text-soft sm:inline">{displayName}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary p-0 text-xs font-bold text-primary-foreground">
              {initials(displayName)}
            </span>
            <span className="hidden sm:block">
              <button onClick={handleSignOut} className="ca-btn ca-btn-ghost flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </span>
          </div>
        </div>
      </header>

      {/* Layout Body */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl lg:grid-cols-[220px_1fr]">
        
        {/* Sidebar */}
        <aside className={`border-b border-border bg-background/55 px-4 py-3 backdrop-blur lg:border-b-0 lg:border-r lg:px-4 lg:py-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto custom-scrollbar ${!open ? "hidden lg:block" : "block"}`}>
          <nav aria-label="Account navigation" className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {items.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-accent text-foreground" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </nav>
          

          
          <button onClick={handleSignOut} className="ca-btn ca-btn-ghost mt-5 w-full flex sm:hidden items-center justify-center gap-2">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 px-5 py-8 sm:px-8 lg:pl-16 lg:pr-10 lg:py-10 xl:pl-24">
          {children}
        </main>
      </div>
    </div>
  );
}
