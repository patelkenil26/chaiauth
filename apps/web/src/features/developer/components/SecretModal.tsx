import React from "react";
import { Check, AlertTriangle } from "lucide-react";
import { useCopy } from "@/shared/hooks/useCopy";

interface SecretModalProps {
  secret: { name: string; value: string };
  /** What is being shown, used in the copy. Defaults to a client secret. */
  kind?: "client secret" | "API key";
  onClose: () => void;
}

export function SecretModal({ secret, kind = "client secret", onClose }: SecretModalProps) {
  const { copied, copy } = useCopy();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="secret-title">
      <section className="ca-glass w-full max-w-lg rounded-xl p-6 ca-fade-up">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
          <Check className="h-5 w-5" />
        </span>
        <h2 id="secret-title" className="mt-4 font-display text-xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
          {secret.name} is ready
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Copy this {kind} now. It will not be shown again after you close this dialog.
        </p>
        
        <div className="mt-5 flex items-center gap-2 rounded-md border border-primary/35 bg-background/60 p-3">
          <code className="ca-mono min-w-0 flex-1 break-all text-sm text-foreground">{secret.value}</code>
          <button aria-label={`Copy ${kind}`} className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition-colors" onClick={() => copy(secret.value, kind === "API key" ? "API key" : "Client secret")}>
            {copied === secret.value ? (
              <Check className="h-5 w-5 text-good" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            )}
          </button>
        </div>
        
        <div className="mt-4 flex gap-3 rounded-md border border-primary/30 bg-accent p-3 text-xs leading-5 text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> 
          Never put this {kind} in browser code or commit it to source control.
        </div>
        
        <button className="ca-btn ca-btn-primary mt-6 w-full" onClick={onClose}>
          I&apos;ve saved the {kind}
        </button>
      </section>
    </div>
  );
}
