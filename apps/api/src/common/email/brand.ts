import { config } from "../config/env.config";

/**
 * Whose name an email goes out under. Emails triggered from an app's own forms (embedded sign-up,
 * password reset, ...) are sent as that app, so its users never see "ChaiAuth". Emails triggered on
 * ChaiAuth's own site keep the ChaiAuth brand.
 */
export interface EmailBrand {
  name: string;
  /** Site the links in the email point to (no trailing slash). */
  url: string;
  /** Absolute https URL, or null for a text-only header. */
  logoUrl: string | null;
  /** #RRGGBB accent for buttons, or null for the default. */
  color: string | null;
  /** "From" display name. */
  fromName: string;
  /** True for a registered app, false for ChaiAuth itself. */
  isApp: boolean;
}

const stripSlash = (url: string) => url.replace(/\/+$/, "");

export const chaiAuthBrand = (): EmailBrand => ({
  name: "ChaiAuth",
  url: stripSlash(config.app.frontendUrl),
  logoUrl: `${stripSlash(config.app.frontendUrl)}/logo/chaiauth-app-icon-512.png`,
  color: null,
  fromName: "ChaiAuth",
  isApp: false,
});

/** Display names go into a "From" header: no characters that could break or inject into it. */
export const safeFromName = (value: string): string => value.replace(/[<>"\r\n,;:@]/g, "").trim().slice(0, 80);

/** The "From" header: the app's display name on ChaiAuth's verified sending address. */
export const formatFrom = (defaultFrom: string, fromName?: string): string => {
  const name = fromName ? safeFromName(fromName) : "";
  if (!name) return defaultFrom;
  const address = /<([^>]+)>/.exec(defaultFrom)?.[1] ?? defaultFrom;
  return `${name} <${address}>`;
};
