import { escapeHtml } from "../../utils/html";

/**
 * Shared building blocks for every transactional email.
 * All dynamic values MUST go through `escapeHtml` (or these helpers) before reaching a template.
 */

const BRAND_GRADIENT =
  "linear-gradient(105deg, #fdba74 0%, #f97316 34%, #ea580c 66%, #9a3412 100%)";

export const heading = (text: string) =>
  `<h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.5px;">${text}</h1>`;

export const paragraph = (html: string, marginBottom = 32) =>
  `<p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 ${marginBottom}px 0;">${html}</p>`;

export const smallPrint = (text: string) =>
  `<p style="margin-top: 32px; font-size: 13px; color: #52525b; line-height: 1.5;">${text}</p>`;

export const ctaButton = (url: string, label: string) => `
  <div>
    <a href="${escapeHtml(url)}" style="display: inline-block; background-color: #ea580c; background-image: ${BRAND_GRADIENT}; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px;">${escapeHtml(label)}</a>
  </div>`;

export const icon = (name: string, hexColor: string) =>
  `<div style="margin-bottom: 24px;"><img src="https://img.icons8.com/fluency-systems-regular/96/${hexColor}/${name}.png" width="56" height="56" alt="" /></div>`;

export const infoCard = (innerHtml: string) =>
  `<div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; padding: 24px; margin-bottom: 32px; text-align: left;">${innerHtml}</div>`;

export const labeledValue = (label: string, value: string, last = false) => `
  <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(label)}</p>
  <p style="margin: 0${last ? "" : " 0 16px"}; font-size: 14px; color: #e4e4e7;">${escapeHtml(value)}</p>`;

/** Wraps `content` (already-safe HTML) in the branded email shell. */
export const baseTemplate = (title: string, content: string, preheader = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; color: #000000;">${escapeHtml(preheader)}</div>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #111111; border: 1px solid #222222; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
          <tr><td height="4" style="background-color: #f97316; background-image: linear-gradient(90deg, #f97316 0%, #fb923c 100%);"></td></tr>
          <tr>
            <td style="padding: 48px 40px; text-align: center;">
              <div style="margin-bottom: 32px;">
                <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Chai<span style="color: #ea580c;">Auth</span></span>
              </div>
              ${content}
            </td>
          </tr>
        </table>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; margin-top: 32px;">
          <tr>
            <td align="center" style="font-size: 13px; color: #666666; line-height: 1.6;">
              &copy; ${new Date().getFullYear()} ChaiAuth Platform. All rights reserved.<br>
              This is an automated system message. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
