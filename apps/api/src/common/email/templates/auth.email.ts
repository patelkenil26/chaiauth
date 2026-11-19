import { escapeHtml } from "../../utils/html";
import {
  baseTemplate,
  callout,
  codeChip,
  ctaButton,
  fallbackLink,
  heading,
  infoCard,
  labeledValue,
  paragraph,
  smallPrint,
  statusTile,
  strong,
} from "./base.layout";

export const verificationEmail = (url: string) =>
  baseTemplate(
    "Verify your email address",
    [
      heading("Verify your email"),
      paragraph("Welcome to ChaiAuth! Confirm your email address to activate your account."),
      ctaButton(url, "Verify email"),
      fallbackLink(url),
      smallPrint("Didn't create an account? You can safely ignore this email. Nothing will happen."),
    ].join(""),
    "Confirm your email to activate your ChaiAuth account.",
  );

export const magicLinkEmail = (url: string) =>
  baseTemplate(
    "Your sign-in link",
    [
      heading("Sign in to ChaiAuth"),
      paragraph(`Use the button below to sign in. The link works once and expires in ${strong("15 minutes")}.`),
      ctaButton(url, "Sign in"),
      fallbackLink(url),
      smallPrint("Didn't ask for this? Ignore this email. Nobody can sign in without access to it."),
    ].join(""),
    "Your one-time sign-in link for ChaiAuth.",
  );

export const resetPasswordEmail = (url: string) =>
  baseTemplate(
    "Reset your password",
    [
      heading("Reset your password"),
      paragraph(`We got a request to reset your ChaiAuth password. This link expires in ${strong("15 minutes")}.`),
      ctaButton(url, "Choose a new password"),
      fallbackLink(url),
      smallPrint("Didn't request this? Ignore this email and your password will stay the same."),
    ].join(""),
    "A secure link to reset your ChaiAuth password.",
  );

export const welcomeEmail = (name: string, url: string) =>
  baseTemplate(
    "Welcome to ChaiAuth",
    [
      statusTile("success", "&#10003;"),
      heading(`Welcome, ${escapeHtml(name)}!`),
      paragraph("Your email is verified and your account is ready. Manage your profile, sessions and security from your dashboard."),
      ctaButton(url, "Go to dashboard"),
    ].join(""),
    "Your ChaiAuth account is ready.",
  );

export const passwordChangedEmail = () =>
  baseTemplate(
    "Your password was changed",
    [
      statusTile("danger", "!"),
      heading("Your password was changed"),
      paragraph("This confirms that the password for your ChaiAuth account was just updated.", 20),
      callout(
        "danger",
        `${strong("Wasn't you?")} Reset your password right away and review your active sessions to secure your account.`,
      ),
    ].join(""),
    "A security notice about your ChaiAuth password.",
  );

export const developerAppRegisteredEmail = (appName: string, clientId: string) =>
  baseTemplate(
    "Your app is registered",
    [
      statusTile("success", "&#10003;"),
      heading("Your app is registered"),
      paragraph("A new application was added to your ChaiAuth developer account.", 20),
      infoCard(labeledValue("App name", appName) + `<p class="e-subtle" style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8C7E6E;">Client ID</p>${codeChip(clientId)}`),
      callout("info", "Keep your client secret private. Never put it in frontend code or a public repository."),
    ].join(""),
    "Confirmation of your new ChaiAuth application.",
  );

export const otpEmail = (otp: string, appName = "ChaiAuth") =>
  baseTemplate(
    "Your login code",
    [
      heading("Your login code"),
      paragraph(
        `Enter this code to sign in to ${strong(escapeHtml(appName))}. It expires in ${strong("10 minutes")}.`,
        20,
      ),
      `<div class="e-panel" style="margin: 0 0 24px 0; padding: 24px 16px; background-color: #FBF7F0; border: 1px solid #EADFCF; border-radius: 12px; text-align: center;">
        <div class="e-brandword" style="font-family: 'SFMono-Regular',Menlo,Consolas,'Courier New',monospace; font-size: 38px; font-weight: 700; letter-spacing: 10px; padding-left: 10px; color: #EA6A1F;">${escapeHtml(otp)}</div>
      </div>`,
      callout(
        "warn",
        `${strong("Don't share this code.")} ChaiAuth will never ask you for it. If you didn't request it, you can ignore this email.`,
      ),
    ].join(""),
    `Your login code: ${otp}`,
  );

export interface SuspiciousLoginDetails {
  device: string;
  location: string;
  time: string;
}

export const suspiciousLoginEmail = ({ device, location, time }: SuspiciousLoginDetails) =>
  baseTemplate(
    "New sign-in to your account",
    [
      statusTile("warn", "!"),
      heading("New sign-in detected"),
      paragraph("Your ChaiAuth account was signed in to from a new device or location. If this was you, no action is needed.", 20),
      infoCard(
        labeledValue("Device", device) + labeledValue("Location (IP)", location) + labeledValue("Time", time, true),
      ),
      callout(
        "danger",
        `${strong("Not you?")} Reset your password immediately and sign out any sessions you don't recognise.`,
      ),
    ].join(""),
    "We noticed a sign-in from a new device.",
  );

export const dataExportEmail = (url: string) =>
  baseTemplate(
    "Your data export is ready",
    [
      statusTile("info", "&#8595;"),
      heading("Your data export is ready"),
      paragraph(
        `The archive with your profile, security settings and session history is ready. The link is valid for ${strong("24 hours")}.`,
      ),
      ctaButton(url, "Download archive"),
      fallbackLink(url),
      smallPrint("Didn't request this? Ignore this email and review your account security settings."),
    ].join(""),
    "Your requested data archive is ready.",
  );
