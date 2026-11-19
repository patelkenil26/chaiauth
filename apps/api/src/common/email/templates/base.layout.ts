import { config } from "../../config/env.config";
import { escapeHtml } from "../../utils/html";

/**
 * Shared building blocks for every transactional email.
 * All dynamic values MUST go through `escapeHtml` (or these helpers) before reaching a template.
 *
 * Light by default (inline styles work everywhere). Each coloured element also carries an `e-*` class;
 * the <style> block overrides those under `prefers-color-scheme: dark`, so mail apps that follow the
 * device theme (Apple Mail, iOS Mail, Outlook, ...) show a dark email on a dark device. Apps that
 * ignore the media query (e.g. Gmail) apply their own automatic dark mode to the light version.
 */

const FONT_DISPLAY = "'Sora','Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_BODY = "'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Light palette (inline). Dark palette lives in DARK_CSS below. */
const C = {
  page: "#FAF6EE",
  card: "#FFFFFF",
  border: "#EADFCF",
  ink: "#1C1712",
  muted: "#5E5245",
  subtle: "#8C7E6E",
  panel: "#FBF7F0",
  brand: "#EA6A1F",
  brandText: "#C2510F",
} as const;

export type Tone = "info" | "success" | "warn" | "danger";

const TONES: Record<Tone, { bg: string; border: string; text: string; tile: string }> = {
  info: { bg: "#FBF7F0", border: "#EADFCF", text: "#5E5245", tile: "#FDEBDD" },
  success: { bg: "#EAF6EE", border: "#BFE3CB", text: "#1E6B3A", tile: "#DDF1E4" },
  warn: { bg: "#FFF4E8", border: "#F8D9B5", text: "#8A4A12", tile: "#FFE8D0" },
  danger: { bg: "#FDEEEC", border: "#F6C9C3", text: "#9B2C1F", tile: "#FADDD9" },
};

const logoUrl = () => `${config.app.frontendUrl.replace(/\/+$/, "")}/logo/chaiauth-app-icon-512.png`;

export const heading = (text: string) =>
  `<h1 class="e-ink" style="margin: 0 0 12px 0; font-family: ${FONT_DISPLAY}; font-size: 24px; line-height: 1.25; font-weight: 700; letter-spacing: -0.02em; color: ${C.ink};">${text}</h1>`;

export const paragraph = (html: string, marginBottom = 28) =>
  `<p class="e-muted" style="margin: 0 0 ${marginBottom}px 0; font-family: ${FONT_BODY}; font-size: 15px; line-height: 1.65; color: ${C.muted};">${html}</p>`;

/** Emphasised inline text (already-escaped input). */
export const strong = (html: string) => `<strong class="e-ink" style="color: ${C.ink}; font-weight: 700;">${html}</strong>`;

export const smallPrint = (text: string) =>
  `<p class="e-subtle" style="margin: 28px 0 0 0; font-family: ${FONT_BODY}; font-size: 13px; line-height: 1.6; color: ${C.subtle};">${text}</p>`;

/** Bulletproof (table-based) button: renders correctly in Outlook too. */
export const ctaButton = (url: string, label: string) => `
  <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0;">
    <tr>
      <td class="e-btn-td" bgcolor="${C.brand}" style="border-radius: 10px; background-color: ${C.brand};">
        <a class="e-btn-a" href="${escapeHtml(url)}" style="display: inline-block; padding: 14px 28px; font-family: ${FONT_BODY}; font-size: 15px; font-weight: 700; line-height: 1; color: #FFFFFF; text-decoration: none; border-radius: 10px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;

/** Shown under a button so the link still works when buttons are blocked or the client strips styles. */
export const fallbackLink = (url: string) =>
  `<p class="e-subtle" style="margin: 20px 0 0 0; font-family: ${FONT_BODY}; font-size: 12px; line-height: 1.6; color: ${C.subtle};">Button not working? Copy and paste this link into your browser:<br><a class="e-link" href="${escapeHtml(url)}" style="color: ${C.brandText}; word-break: break-all; text-decoration: underline;">${escapeHtml(url)}</a></p>`;

/** Round status tile with a text glyph. No remote images, so it never gets blocked. */
export const statusTile = (tone: Tone, glyph: string) => {
  const t = TONES[tone];
  return `
  <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 20px 0;">
    <tr>
      <td class="e-tile-${tone}" width="48" height="48" align="center" valign="middle" bgcolor="${t.tile}" style="width: 48px; height: 48px; border-radius: 14px; background-color: ${t.tile}; color: ${t.text}; font-family: ${FONT_DISPLAY}; font-size: 22px; font-weight: 700; line-height: 48px;">${glyph}</td>
    </tr>
  </table>`;
};

/** Tinted callout box. `html` must already be escaped. */
export const callout = (tone: Tone, html: string, marginTop = 0) => {
  const t = TONES[tone];
  return `<div class="e-box-${tone}" style="margin: ${marginTop}px 0 0 0; padding: 16px 18px; background-color: ${t.bg}; border: 1px solid ${t.border}; border-radius: 12px; text-align: left; font-family: ${FONT_BODY}; font-size: 14px; line-height: 1.6; color: ${t.text};">${html}</div>`;
};

export const infoCard = (innerHtml: string) =>
  `<div class="e-panel" style="margin: 0 0 24px 0; padding: 20px 22px; background-color: ${C.panel}; border: 1px solid ${C.border}; border-radius: 12px; text-align: left;">${innerHtml}</div>`;

export const labeledValue = (label: string, value: string, last = false) => `
  <p class="e-subtle" style="margin: 0 0 4px 0; font-family: ${FONT_BODY}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.subtle};">${escapeHtml(label)}</p>
  <p class="e-ink" style="margin: 0${last ? "" : " 0 16px 0"}; font-family: ${FONT_BODY}; font-size: 15px; line-height: 1.5; color: ${C.ink};">${escapeHtml(value)}</p>`;

/** Monospace value chip (client IDs, codes). */
export const codeChip = (value: string) =>
  `<code class="e-chip" style="font-family: 'SFMono-Regular',Menlo,Consolas,'Courier New',monospace; font-size: 13px; color: ${C.brandText}; background-color: ${C.page}; border: 1px solid ${C.border}; padding: 2px 8px; border-radius: 6px;">${escapeHtml(value)}</code>`;

const DARK_CSS = `
    @media (prefers-color-scheme: dark) {
      .e-page { background-color: #15110D !important; }
      .e-card { background-color: #1E1913 !important; border-color: #342C23 !important; }
      .e-ink { color: #F6F0E7 !important; }
      .e-muted { color: #BDAF9E !important; }
      .e-subtle { color: #9A8C7B !important; }
      .e-link { color: #F58A3C !important; }
      .e-panel { background-color: #26201A !important; border-color: #342C23 !important; }
      .e-chip { background-color: #15110D !important; border-color: #342C23 !important; color: #F58A3C !important; }
      .e-rule { border-color: #342C23 !important; }
      .e-btn-td { background-color: #F58A3C !important; }
      .e-btn-a { color: #1C1712 !important; }
      .e-box-info { background-color: #26201A !important; border-color: #342C23 !important; color: #BDAF9E !important; }
      .e-box-success { background-color: #12261A !important; border-color: #26563A !important; color: #8FD9A8 !important; }
      .e-box-warn { background-color: #2B1E12 !important; border-color: #5A3A1C !important; color: #F5B77A !important; }
      .e-box-danger { background-color: #2D1514 !important; border-color: #5E2A26 !important; color: #F3A39A !important; }
      .e-tile-success { background-color: #12261A !important; color: #8FD9A8 !important; }
      .e-tile-warn { background-color: #2B1E12 !important; color: #F5B77A !important; }
      .e-tile-danger { background-color: #2D1514 !important; color: #F3A39A !important; }
      .e-tile-info { background-color: #26201A !important; color: #F58A3C !important; }
      .e-brandword { color: #F58A3C !important; }
    }`;

/** Wraps `content` (already-safe HTML) in the branded email shell. */
export const baseTemplate = (title: string, content: string, preheader = "") => {
  const site = config.app.frontendUrl.replace(/\/+$/, "");
  return `
<!DOCTYPE html>
<html lang="en" style="color-scheme: light dark; supported-color-schemes: light dark;">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 620px) {
      .e-outer { padding: 20px 12px !important; }
      .e-pad { padding: 28px 22px !important; }
    }${DARK_CSS}
  </style>
</head>
<body class="e-page" style="margin: 0; padding: 0; background-color: ${C.page}; font-family: ${FONT_BODY}; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: ${C.page};">${escapeHtml(preheader)}</div>
  <table class="e-page e-outer" role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${C.page}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table class="e-card" role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; width: 100%; background-color: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px;">
          <tr>
            <td class="e-pad" style="padding: 36px 40px; text-align: left;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td valign="middle" style="padding-right: 10px;">
                    <img src="${escapeHtml(logoUrl())}" width="36" height="36" alt="ChaiAuth" style="display: block; width: 36px; height: 36px; border-radius: 9px;">
                  </td>
                  <td valign="middle">
                    <span class="e-ink" style="font-family: ${FONT_DISPLAY}; font-size: 20px; font-weight: 700; letter-spacing: -0.03em; color: ${C.ink};">Chai<span class="e-brandword" style="color: ${C.brand};">Auth</span></span>
                  </td>
                </tr>
              </table>
              ${content}
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; width: 100%; margin-top: 24px;">
          <tr>
            <td align="center" class="e-subtle" style="font-family: ${FONT_BODY}; font-size: 12px; line-height: 1.7; color: ${C.subtle};">
              <a class="e-subtle" href="${escapeHtml(site)}/privacy" style="color: ${C.subtle}; text-decoration: underline;">Privacy</a>
              &nbsp;&middot;&nbsp;
              <a class="e-subtle" href="${escapeHtml(site)}/terms" style="color: ${C.subtle}; text-decoration: underline;">Terms</a>
              <br>
              &copy; ${new Date().getFullYear()} ChaiAuth. This is an automated message, please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
