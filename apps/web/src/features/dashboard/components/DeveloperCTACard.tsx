import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DeveloperCTACard() {
  return (
    <section className="rounded-md border border-border bg-secondary/50 p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">
        <p className="ca-mono text-[0.68rem] uppercase text-primary" style={{ letterSpacing: ".14em" }}>
          Build with ChaiAuth
        </p>
        <h2 className="mt-3 font-display text-xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
          Connect your first app
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create OAuth credentials, register callback URLs, and test the consent flow.
        </p>
        <Link href="/developer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-transform hover:gap-3">
          Open Developer Console <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
