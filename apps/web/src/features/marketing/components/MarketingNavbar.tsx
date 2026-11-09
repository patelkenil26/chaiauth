"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/shared/components/Logo";
import { navLinks } from "../content";

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                pathname === l.href ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="ca-btn ca-btn-ghost !h-10">Sign in</Link>
          <Link href="/register" className="ca-btn ca-btn-primary !h-10">Get started</Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-5 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-foreground hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className="ca-btn ca-btn-ghost">Sign in</Link>
            <Link href="/register" onClick={() => setOpen(false)} className="ca-btn ca-btn-primary">Get started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
