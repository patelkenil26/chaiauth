import React from "react";
import Link from "next/link";
import { ArrowUpRight, Blocks, ShieldCheck, Smartphone } from "lucide-react";
import { IconTile } from "@/shared/components/IconTile";

const ACTIONS = [
  { href: "/security", icon: ShieldCheck, title: "Security", text: "Password, 2FA and passkeys" },
  { href: "/sessions", icon: Smartphone, title: "Sessions", text: "Review signed-in devices" },
  { href: "/developer", icon: Blocks, title: "Developer", text: "Apps, secrets and API keys" },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {ACTIONS.map(({ href, icon: Icon, title, text }) => (
        <Link
          key={href}
          href={href}
          className="ca-glass group relative flex flex-col gap-4 p-5 transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <IconTile>
              <Icon className="h-5 w-5" />
            </IconTile>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
