import { useId, useState, type FormEvent, type ReactNode } from "react";
import type { AuthContext, SignInResult } from "../core/client";
import { Field, PasswordField, cssVariables, cx, errorMessage, type SignInFormAppearance } from "./form-utils";
import { useChaiAuth } from "./provider";
import { useChaiAuthStyles } from "./styles";

export type { SignInFormAppearance } from "./form-utils";

export interface SignInFormProps {
  /** Path on your site to return to after signing in (browser-only mode). */
  returnTo?: string;
  /** Called after a browser-only sign-in succeeds. (In backend mode the browser navigates to your server.) */
  onSuccess?: (returnTo?: string) => void;
  /**
   * Backend mode: fetch an authorization context from YOUR server (PKCE verifier + client secret stay there).
   * Called on every attempt; the server must remember the matching state/verifier (e.g. in a signed cookie).
   */
  getAuthContext?: () => Promise<AuthContext>;
  /** Social providers to offer. Must be enabled for your app in ChaiAuth. Example: `["google"]`. */
  providers?: string[];
  /** Offer "Email me a sign-in code" as a passwordless alternative to the password. */
  emailCode?: boolean;
  title?: ReactNode;
  subtitle?: ReactNode;
  submitLabel?: string;
  /** Link shown next to the password field. */
  forgotPasswordHref?: string;
  /** Shown below the form, e.g. "Don't have an account? Sign up". */
  footer?: ReactNode;
  appearance?: SignInFormAppearance;
}

const PROVIDER_LABELS: Record<string, string> = { google: "Google", github: "GitHub" };

type Step = "credentials" | "code" | "mfa";

/**
 * Sign-in rendered inside YOUR page: email + password, optional email code and social buttons, and
 * the two-factor step for accounts that have it.
 */
export function SignInForm({
  returnTo,
  onSuccess,
  getAuthContext,
  providers = [],
  emailCode = false,
  title = "Sign in",
  subtitle,
  submitLabel = "Continue",
  forgotPasswordHref,
  footer,
  appearance,
}: SignInFormProps) {
  useChaiAuthStyles();
  const { signInWithPassword, signInWithEmailCode, sendEmailCode, verifyMfa, signInWithProvider } = useChaiAuth();
  const errorId = useId();
  const cls = appearance?.classNames ?? {};
  const backend = Boolean(getAuthContext);

  const [step, setStep] = useState<Step>("credentials");
  const [mode, setMode] = useState<"password" | "code">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mfa, setMfa] = useState<{ token: string; context: AuthContext } | null>(null);
  /** "submit", or the provider being redirected to. */
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (kind: string, task: () => Promise<void>) => {
    setError(null);
    setNotice(null);
    setPending(kind);
    try {
      await task();
    } catch (err) {
      setError(errorMessage(err));
      setPending(null);
    }
  };

  const handleResult = (result: SignInResult) => {
    if (result.status === "mfa_required") {
      setMfa({ token: result.mfaToken, context: result.context });
      setCode("");
      setStep("mfa");
      setPending(null);
      return;
    }
    // Backend mode navigates away: keep the button busy until the page unloads
    if (!backend) {
      setPending(null);
      onSuccess?.(result.returnTo);
    }
  };

  const credentialsFor = (value: string) => (value.includes("@") ? { email: value } : { username: value });

  const submitPassword = (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    void run("submit", async () => {
      const context = getAuthContext ? await getAuthContext() : undefined;
      handleResult(
        await signInWithPassword({ ...credentialsFor(identifier.trim()), password }, { returnTo, context }),
      );
    });
  };

  const requestCode = (e?: FormEvent) => {
    e?.preventDefault();
    if (pending) return;
    void run("submit", async () => {
      await sendEmailCode(identifier.trim());
      setCode("");
      setStep("code");
      setNotice(`If an account exists for ${identifier.trim()}, we sent a 6-digit code to it.`);
      setPending(null);
    });
  };

  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    void run("submit", async () => {
      const context = getAuthContext ? await getAuthContext() : undefined;
      handleResult(await signInWithEmailCode({ email: identifier.trim(), code: code.trim() }, { returnTo, context }));
    });
  };

  const submitMfa = (e: FormEvent) => {
    e.preventDefault();
    if (pending || !mfa) return;
    void run("submit", async () => {
      handleResult(await verifyMfa({ mfaToken: mfa.token, code, context: mfa.context }, { returnTo, backend }));
    });
  };

  const social = (provider: string) =>
    void run(provider, async () => {
      const context = getAuthContext ? await getAuthContext() : undefined;
      await signInWithProvider(provider, { returnTo, context });
    });

  const back = () => {
    setStep("credentials");
    setMfa(null);
    setCode("");
    setError(null);
    setNotice(null);
  };

  const errorBlock = error && (
    <p id={errorId} role="alert" className={cx("chaiauth-error", cls.error)}>
      {error}
    </p>
  );
  const noticeBlock = notice && (
    <p role="status" className={cx("chaiauth-notice", cls.success)}>
      {notice}
    </p>
  );
  const busy = pending !== null;

  // ── Two-factor step ──────────────────────────────────────
  if (step === "mfa") {
    return (
      <div className={cx("chaiauth-form", cls.root)} style={cssVariables(appearance?.variables)} data-chaiauth="sign-in-mfa">
        <header>
          <h2 className={cx("chaiauth-form-title", cls.title)}>Two-step verification</h2>
          <p className={cx("chaiauth-form-subtitle", cls.subtitle)}>
            Enter the 6-digit code from your authenticator app, or one of your 8-character backup codes.
          </p>
        </header>
        <form onSubmit={submitMfa} noValidate>
          <Field
            label="Authentication code"
            value={code}
            onChange={setCode}
            autoComplete="one-time-code"
            inputMode="text"
            maxLength={8}
            describedBy={error ? errorId : undefined}
            appearance={appearance}
            autoFocus
          />
          {errorBlock}
          <button type="submit" className={cx("chaiauth-submit", cls.button)} disabled={busy || code.trim().length < 6}>
            {busy ? "Verifying…" : "Verify"}
          </button>
          <button type="button" className={cx("chaiauth-link", cls.link)} onClick={back}>
            Back to sign in
          </button>
        </form>
      </div>
    );
  }

  // ── Emailed code step ────────────────────────────────────
  if (step === "code") {
    return (
      <div className={cx("chaiauth-form", cls.root)} style={cssVariables(appearance?.variables)} data-chaiauth="sign-in-code">
        <header>
          <h2 className={cx("chaiauth-form-title", cls.title)}>Check your email</h2>
          <p className={cx("chaiauth-form-subtitle", cls.subtitle)}>Enter the 6-digit code we sent you.</p>
        </header>
        <form onSubmit={submitCode} noValidate>
          <Field
            label="Sign-in code"
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, ""))}
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            describedBy={error ? errorId : undefined}
            appearance={appearance}
            autoFocus
          />
          {noticeBlock}
          {errorBlock}
          <button type="submit" className={cx("chaiauth-submit", cls.button)} disabled={busy || code.length !== 6}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div className="chaiauth-row">
            <button type="button" className={cx("chaiauth-link", cls.link)} disabled={busy} onClick={() => requestCode()}>
              Resend code
            </button>
            <button type="button" className={cx("chaiauth-link", cls.link)} onClick={back}>
              Use a different method
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Credentials step ─────────────────────────────────────
  const passwordless = mode === "code";
  return (
    <div className={cx("chaiauth-form", cls.root)} style={cssVariables(appearance?.variables)} data-chaiauth="sign-in">
      {(title || subtitle) && (
        <header>
          {title && <h2 className={cx("chaiauth-form-title", cls.title)}>{title}</h2>}
          {subtitle && <p className={cx("chaiauth-form-subtitle", cls.subtitle)}>{subtitle}</p>}
        </header>
      )}

      {providers.length > 0 && (
        <>
          <div className="chaiauth-providers">
            {providers.map((p) => (
              <button
                key={p}
                type="button"
                className={cx("chaiauth-provider", cls.providerButton)}
                disabled={busy}
                onClick={() => social(p)}
              >
                {pending === p ? "Redirecting…" : `Continue with ${PROVIDER_LABELS[p] ?? p}`}
              </button>
            ))}
          </div>
          <div className={cx("chaiauth-divider", cls.divider)} role="separator">
            <span>or</span>
          </div>
        </>
      )}

      <form onSubmit={passwordless ? requestCode : submitPassword} noValidate>
        <Field
          label="Email address"
          value={identifier}
          onChange={setIdentifier}
          autoComplete="username"
          inputMode="email"
          describedBy={error ? errorId : undefined}
          appearance={appearance}
        />

        {!passwordless && (
          <PasswordField
            value={password}
            onChange={setPassword}
            describedBy={error ? errorId : undefined}
            appearance={appearance}
            aside={
              forgotPasswordHref && (
                <a href={forgotPasswordHref} className={cx("chaiauth-link", cls.link)}>
                  Forgot password?
                </a>
              )
            }
          />
        )}

        {errorBlock}

        <button
          type="submit"
          className={cx("chaiauth-submit", cls.button)}
          disabled={busy || !identifier || (!passwordless && !password)}
        >
          {busy ? (passwordless ? "Sending…" : "Signing in…") : passwordless ? "Email me a code" : submitLabel}
        </button>

        {emailCode && (
          <button
            type="button"
            className={cx("chaiauth-link", cls.link)}
            onClick={() => {
              setMode(passwordless ? "password" : "code");
              setError(null);
            }}
          >
            {passwordless ? "Use your password instead" : "Email me a sign-in code instead"}
          </button>
        )}
      </form>

      {footer && <div className="chaiauth-form-footer">{footer}</div>}
    </div>
  );
}
