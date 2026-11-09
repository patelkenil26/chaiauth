"use client";

import React from "react";
import { Check } from "lucide-react";

interface PasswordRulesProps {
  value: string;
}

export function PasswordRules({ value }: PasswordRulesProps) {
  const rules = [
    { ok: value.length >= 8, label: "8+ characters" },
    { ok: /[A-Z]/.test(value) && /[a-z]/.test(value), label: "Upper & lowercase" },
    { ok: /\d/.test(value), label: "A number" },
  ];
  
  const score = rules.filter((r) => r.ok).length + (value.length >= 12 ? 1 : 0);
  
  return (
    <div className="space-y-2 pt-1 mt-2">
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-colors duration-300 ${i < score ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[0.74rem]">
        {rules.map((r) => (
          <li key={r.label} className={`flex items-center gap-1 transition-colors ${r.ok ? "text-good" : "text-muted-foreground"}`}>
            <Check className={`h-3 w-3 ${!r.ok && "opacity-30"}`} />
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
