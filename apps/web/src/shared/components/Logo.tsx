import Link from "next/link";

// Keyhole + person mark (from the ChaiAuth logo kit).
const MARK_PATH =
  "M0 32A32 32 0 1 0 64 32A32 32 0 1 0 0 32Z M26 35.39A12 12 0 1 1 38 35.39L45.5 48Q46.5 52 42.5 52L21.5 52Q17.5 52 18.5 48Z";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" fill="var(--primary)" d={MARK_PATH} />
    </svg>
  );
}

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <Link href="/" aria-label="ChaiAuth home" className={`inline-flex items-center gap-2.5 ${className || ""}`}>
      <LogoMark className="h-9 w-9 transition-transform duration-300 hover:scale-105" />
      {!iconOnly && (
        <span className="font-display text-[1.25rem] font-semibold tracking-[-0.035em] text-foreground">
          Chai<span className="text-primary">Auth</span>
        </span>
      )}
    </Link>
  );
}
