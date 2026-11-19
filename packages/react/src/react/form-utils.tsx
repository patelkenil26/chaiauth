import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface SignInFormAppearance {
  /**
   * Theme tokens, applied as CSS variables. Anything you leave out inherits from the surrounding page
   * (text colour, font) or uses a neutral default, so the form blends into your design.
   */
  variables?: {
    /** Button and focus colour. */
    primary?: string;
    /** Text on the primary button. */
    primaryForeground?: string;
    /** Page text colour. Defaults to the inherited colour. */
    foreground?: string;
    /** Secondary text. */
    muted?: string;
    /** Input background. Defaults to transparent. */
    inputBackground?: string;
    /** Input and divider border. */
    border?: string;
    danger?: string;
    radius?: string;
    fontFamily?: string;
  };
  /** Your own class names (Tailwind etc.), added next to the built-in ones. */
  classNames?: Partial<
    Record<
      | "root"
      | "title"
      | "subtitle"
      | "field"
      | "label"
      | "input"
      | "button"
      | "providerButton"
      | "error"
      | "success"
      | "divider"
      | "link",
      string
    >
  >;
}

export const cx = (...parts: Array<string | undefined | false>) => parts.filter(Boolean).join(" ");

export const cssVariables = (v: SignInFormAppearance["variables"]): CSSProperties => {
  const map: Record<string, string | undefined> = {
    "--chaiauth-primary": v?.primary,
    "--chaiauth-primary-fg": v?.primaryForeground,
    "--chaiauth-fg": v?.foreground,
    "--chaiauth-muted": v?.muted,
    "--chaiauth-input-bg": v?.inputBackground,
    "--chaiauth-border": v?.border,
    "--chaiauth-danger": v?.danger,
    "--chaiauth-radius": v?.radius,
    "--chaiauth-font": v?.fontFamily,
  };
  return Object.fromEntries(Object.entries(map).filter(([, value]) => value)) as CSSProperties;
};

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong. Please try again.";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric";
  placeholder?: string;
  maxLength?: number;
  describedBy?: string;
  /** Right-hand slot in the label row, e.g. "Forgot password?". */
  aside?: ReactNode;
  appearance?: SignInFormAppearance;
  autoFocus?: boolean;
}

/** Labelled text input. */
export function Field({ label, value, onChange, type = "text", appearance, aside, describedBy, ...rest }: FieldProps) {
  const id = useId();
  const cls = appearance?.classNames ?? {};
  return (
    <div className={cx("chaiauth-field", cls.field)}>
      <div className="chaiauth-label-row">
        <label htmlFor={id} className={cx("chaiauth-label", cls.label)}>
          {label}
        </label>
        {aside}
      </div>
      <input
        id={id}
        className={cx("chaiauth-input", cls.input)}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={describedBy}
        autoCapitalize="none"
        spellCheck={false}
        {...rest}
      />
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({
  label = "Password",
  autoComplete = "current-password",
  appearance,
  aside,
  describedBy,
  value,
  onChange,
}: {
  label?: string;
  autoComplete?: string;
  appearance?: SignInFormAppearance;
  aside?: ReactNode;
  describedBy?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const cls = appearance?.classNames ?? {};
  return (
    <div className={cx("chaiauth-field", cls.field)}>
      <div className="chaiauth-label-row">
        <label htmlFor={id} className={cx("chaiauth-label", cls.label)}>
          {label}
        </label>
        {aside}
      </div>
      <div className="chaiauth-password">
        <input
          id={id}
          className={cx("chaiauth-input", cls.input)}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="chaiauth-reveal"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

// ── Cloudflare Turnstile (anti-bot) ─────────────────────────
interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let turnstileLoading: Promise<void> | undefined;

const loadTurnstile = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.reject(new Error("Turnstile needs a browser"));
  if (window.turnstile) return Promise.resolve();
  turnstileLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      turnstileLoading = undefined;
      reject(new Error("Could not load the anti-bot check."));
    };
    document.head.appendChild(script);
  });
  return turnstileLoading;
};

/**
 * Renders a Turnstile widget into `ref` and tracks its token. No-op without a site key.
 * The token is single-use: call `reset()` after every attempt.
 */
export function useTurnstile(siteKey: string | undefined) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(null),
          "error-callback": () => setFailed("The anti-bot check failed to load. Refresh and try again."),
        });
      })
      .catch((err: Error) => setFailed(err.message));
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [siteKey]);

  const reset = () => {
    setToken(null);
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  };

  return { ref, token, failed, reset };
}
