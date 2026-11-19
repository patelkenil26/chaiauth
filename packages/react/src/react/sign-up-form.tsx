import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Field, PasswordField, cssVariables, cx, errorMessage, useTurnstile, type SignInFormAppearance } from "./form-utils";
import { useChaiAuth } from "./provider";
import { useChaiAuthStyles } from "./styles";

export interface SignUpFormProps {
  /**
   * Cloudflare Turnstile site key. ChaiAuth requires the anti-bot check for sign-ups, so this is needed in
   * production. Add your site's domain to the widget in the Cloudflare dashboard.
   */
  turnstileSiteKey?: string;
  /** Called after the account was created (the user still has to verify their email before signing in). */
  onSuccess?: (message: string) => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  submitLabel?: string;
  /** Shown below the form, e.g. "Already have an account? Sign in". */
  footer?: ReactNode;
  appearance?: SignInFormAppearance;
}

/** Account creation rendered inside YOUR page. ChaiAuth emails a verification link afterwards. */
export function SignUpForm({
  turnstileSiteKey,
  onSuccess,
  title = "Create your account",
  subtitle,
  submitLabel = "Create account",
  footer,
  appearance,
}: SignUpFormProps) {
  useChaiAuthStyles();
  const { signUp } = useChaiAuth();
  const errorId = useId();
  const cls = appearance?.classNames ?? {};
  const captcha = useTurnstile(turnstileSiteKey);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const message = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        captchaToken: captcha.token ?? undefined,
      });
      setDone(message);
      onSuccess?.(message);
    } catch (err) {
      setError(errorMessage(err));
      captcha.reset(); // a Turnstile token works once
    } finally {
      setPending(false);
    }
  };

  const style = cssVariables(appearance?.variables);

  if (done) {
    return (
      <div className={cx("chaiauth-form", cls.root)} style={style} data-chaiauth="sign-up-done">
        <header>
          <h2 className={cx("chaiauth-form-title", cls.title)}>Check your email</h2>
        </header>
        <p role="status" className={cx("chaiauth-notice", cls.success)}>
          {done}
        </p>
        {footer && <div className="chaiauth-form-footer">{footer}</div>}
      </div>
    );
  }

  const needsCaptcha = Boolean(turnstileSiteKey);
  return (
    <div className={cx("chaiauth-form", cls.root)} style={style} data-chaiauth="sign-up">
      {(title || subtitle) && (
        <header>
          {title && <h2 className={cx("chaiauth-form-title", cls.title)}>{title}</h2>}
          {subtitle && <p className={cx("chaiauth-form-subtitle", cls.subtitle)}>{subtitle}</p>}
        </header>
      )}

      <form onSubmit={(e) => void submit(e)} noValidate>
        <Field label="Full name" value={name} onChange={setName} autoComplete="name" appearance={appearance} />
        <Field
          label="Email address"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          inputMode="email"
          describedBy={error ? errorId : undefined}
          appearance={appearance}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
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
          disabled={pending || !name || !email || !password || (needsCaptcha && !captcha.token)}
        >
          {pending ? "Creating account…" : submitLabel}
        </button>
      </form>

      {footer && <div className="chaiauth-form-footer">{footer}</div>}
    </div>
  );
}
