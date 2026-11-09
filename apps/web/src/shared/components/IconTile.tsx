import type { ReactNode } from "react";

/** Gradient icon badge used at the start of every dashboard card. */
export function IconTile({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "danger" }) {
  return <span className={`ca-tile ${tone === "danger" ? "ca-tile-danger" : ""}`}>{children}</span>;
}
