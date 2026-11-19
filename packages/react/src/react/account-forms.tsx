import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Field, PasswordField, cssVariables, cx, errorMessage, useTurnstile, type SignInFormAppearance } from "./form-utils";
import { useChaiAuth } from "./provider";
import { useChaiAuthStyles } from "./styles";

interface CommonProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Shown below the form, e.g. a "Back to sign in" link. */
  footer?: ReactNode;
  appearance?: SignInFormAppearance;
}

function Shell({
  title,
  subtitle,
  footer,
  appearance,
  kind,
  children,
}: CommonProps & { kind: string; children: ReactNode }) {
  const cls = appearance?.classNames ?? {};
  return (
    <div className={cx("chaiauth-form", cls.root)} style={cssVariables(appearance?.variables)} data-chaiauth={kind}>
      {(title || subtitle) && (
        <header>
          {title && <h2 className={cx("chaiauth-form-title", cls.title)}>{title}</h2>}
          {subtitle && <p className={cx("chaiauth-form-subtitle", cls.subtitle)}>{subtitle}</p>}
        </header>
      )}
      {children}
      {footer && <div className="chaiauth-form-footer">{footer}</div>}
    </div>
  );
}

// ── Forgot password ─────────────────────────────────────────
export interface ForgotPasswordFormProps extends CommonProps {
  /** Cloudflare Turnstile site key. ChaiAuth requires the anti-bot check for emails it sends. */
  turnstileSiteKey?: string;
  submitLabel?: string;
}

/**
 * "Email me a reset link". The email goes out under YOUR app's name and its link opens YOUR
 * `/reset-password` page, where you render `<ResetPasswordForm />`.
 */
export function ForgotPasswordForm({
  turnstileSiteKey,
  submitLabel = "Send reset link",
  title = "Forgot your password?",
  subtitle = "Enter your email and we will send you a link to choose a new one.",
  footer,
  appearance,
}: ForgotPasswordFormProps) {
  useChaiAuthStyles();
  const { forgotPassword } = useChaiAuth();
  const errorId = useId();
  const cls = appearance?.classNames ?? {};
  const captcha = useTurnstile(turnstileSiteKey);

  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      setDone(await forgotPassword({ email: email.trim(), captchaToken: captcha.token ?? undefined }));
    } catch (err) {
      setError(errorMessage(err));
      captcha.reset();
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <Shell title="Check your email" footer={footer} appearance={appearance} kind="forgot-password-done">
        <p role="status" className={cx("chaiauth-notice", cls.success)}>
          {done}
        </p>
      </Shell>
    );
  }

  const needsCaptcha = Boolean(turnstileSiteKey);
  return (
    <Shell title={title} subtitle={subtitle} footer={footer} appearance={appearance} kind="forgot-password">
      <form onSubmit={(e) => void submit(e)} noValidate>
        <Field
          label="Email address"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          inputMode="email"
          describedBy={error ? errorId : undefined}
          appearance={appearance}
        />
        {needsCaptcha && <div ref={captcha.ref} className="chaiauth-captcha" />}
        {(error || captcha.failed) && (
          <p id={errorId} role="alert" className={cx("chaiauth-error", cls.error)}>
            {error ?? captcha.failed}
          </p>
        )}
        <button
          type="submit"
          className={cx("chaiauth-submit", cls.button)}
          disabled={pending || !email || (needsCaptcha && !captcha.token)}
        >
          {pending ? "Sending…" : submitLabel}
        </button>
      </form>
    </Shell>
  );
}

// ── Reset password ──────────────────────────────────────────
export interface ResetPasswordFormProps extends CommonProps {
  /** The `token` query parameter from the link in the email. */
  token: string | null | undefined;
  /** Called after the password was changed. */
  onSuccess?: () => void;
  submitLabel?: string;
  /** Shown after success, e.g. a "Sign in" link. */
  successFooter?: ReactNode;
}

/** Choose a new password. Render it on the page your reset links open (`/reset-password?token=…`). */
export function ResetPasswordForm({
  token,
  onSuccess,
  submitLabel = "Update password",
  title = "Choose a new password",
  subtitle,
  footer,
  successFooter,
  appearance,
}: ResetPasswordFormProps) {
  useChaiAuthStyles();
  const { resetPassword } = useChaiAuth();
  const errorId = useId();
  const cls = appearance?.classNames ?? {};

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  if (!token) {
    return (
      <Shell title="This link is not valid" footer={footer} appearance={appearance} kind="reset-password-invalid">
        <p role="alert" className={cx("chaiauth-error", cls.error)}>
          The reset link is missing its token. Request a new one and use the link from the latest email.
        </p>
      </Shell>
    );
  }

  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending || password !== confirm) return;
    setError(null);
    setPending(true);
    try {
      setDone(await resetPassword({ token, password }));
      onSuccess?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <Shell title="Password updated" footer={successFooter ?? footer} appearance={appearance} kind="reset-password-done">
        <p role="status" className={cx("chaiauth-notice", cls.success)}>
          {done}
        </p>
      </Shell>
    );
  }

  return (
    <Shell title={title} subtitle={subtitle} footer={footer} appearance={appearance} kind="reset-password">
      <form onSubmit={(e) => void submit(e)} noValidate>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          describedBy={error ? errorId : undefined}
          appearance={appearance}
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
          describedBy={error ? errorId : undefined}
          appearance={appearance}
        />
        {(error || mismatch) && (
          <p id={errorId} role="alert" className={cx("chaiauth-error", cls.error)}>
            {error ?? "The two passwords do not match."}
          </p>
        )}
        <button
          type="submit"
          className={cx("chaiauth-submit", cls.button)}
          disabled={pending || !password || password !== confirm}
        >
          {pending ? "Updating…" : submitLabel}
        </button>
      </form>
    </Shell>
  );
}

// ── Verify email ────────────────────────────────────────────
export interface VerifyEmailProps extends CommonProps {
  /** The `token` query parameter from the link in the email. */
  token: string | null | undefined;
  /** Called once the address is verified. */
  onVerified?: () => void;
  /** Shown after success, e.g. a "Continue to sign in" link. */
  successFooter?: ReactNode;
}

/** Confirms the email address. Render it on the page your verification links open (`/verify-email?token=…`). */
export function VerifyEmail({ token, onVerified, title, footer, successFooter, appearance }: VerifyEmailProps) {
  useChaiAuthStyles();
  const { verifyEmail } = useChaiAuth();
  const cls = appearance?.classNames ?? {};
  const [state, setState] = useState<{ status: "verifying" | "done" | "error"; message?: string }>({
    status: token ? "verifying" : "error",
    message: token ? undefined : "The verification link is missing its token.",
  });
  // A link is single use: React StrictMode runs effects twice in development, which must not spend it twice
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .then((message) => {
        setState({ status: "done", message });
        onVerified?.();
      })
      .catch((err: unknown) => setState({ status: "error", message: errorMessage(err) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (state.status === "verifying") {
    return (
      <Shell title={title ?? "Verifying your email…"} appearance={appearance} kind="verify-email">
        <p role="status" className={cx("chaiauth-notice", cls.success)}>
          Just a moment.
        </p>
      </Shell>
    );
  }
  if (state.status === "done") {
    return (
      <Shell title={title ?? "Email verified"} footer={successFooter ?? footer} appearance={appearance} kind="verify-email-done">
        <p role="status" className={cx("chaiauth-notice", cls.success)}>
          {state.message}
        </p>
      </Shell>
    );
  }
  return (
    <Shell title={title ?? "We could not verify your email"} footer={footer} appearance={appearance} kind="verify-email-error">
      <p role="alert" className={cx("chaiauth-error", cls.error)}>
        {state.message}
      </p>
    </Shell>
  );
}
