"use client";

import type { MouseEvent, ReactNode } from "react";

/** Glass card with a glow that follows the cursor. */
export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  return (
    <div onMouseMove={onMove} className={`ca-glass ca-spot ${className}`}>
      {children}
    </div>
  );
}
