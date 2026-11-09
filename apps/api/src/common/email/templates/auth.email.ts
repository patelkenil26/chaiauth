import { escapeHtml } from "../../utils/html";
import {
  baseTemplate,
  ctaButton,
  heading,
  icon,
  infoCard,
  labeledValue,
  paragraph,
  smallPrint,
} from "./base.layout";

export const verificationEmail = (url: string) =>
  baseTemplate(
    "Verify your email address",
    [
      heading("Verify your email address"),
      paragraph(
        "Welcome to ChaiAuth! To complete your registration and activate your account, please verify your email address by clicking the button below.",
      ),
      ctaButton(url, "Verify Email Address"),
      smallPrint(
        "If you didn't request this verification, you can safely ignore this email. Your account will remain inactive.",
      ),
    ].join(""),
    "Action required to activate your ChaiAuth account.",
  );

export const magicLinkEmail = (url: string) =>
  baseTemplate(
    "Your sign-in link",
    [
      icon("key", "f97316"),
      heading("Sign in to ChaiAuth"),
      paragraph(
        "Click the button below to sign in. This link works once and expires in <strong style=\"color: #ffffff;\">15 minutes</strong>.",
      ),
      ctaButton(url, "Sign in"),
      smallPrint(
        "If you didn't request this link, you can safely ignore this email. Nobody can sign in without access to it.",
      ),
    ].join(""),
    "Your one-time sign-in link for ChaiAuth.",
  );

export const resetPasswordEmail = (url: string) =>
  baseTemplate(
    "Reset your password",
    [
      heading("Reset your password"),
      paragraph(
        "We received a request to reset the password for your ChaiAuth account. Click the button below to choose a new secure password. This link will expire in 15 minutes.",
      ),
      ctaButton(url, "Reset Password"),
      smallPrint(
        "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.",
      ),
    ].join(""),
    "Secure link to reset your ChaiAuth password.",
  );

export const welcomeEmail = (name: string, url: string) =>
  baseTemplate(
    "Welcome to ChaiAuth!",
    [
      icon("checked--v1", "f97316"),
      heading(`Welcome aboard, ${escapeHtml(name)}!`),
      paragraph(
        "Your email has been successfully verified. You now have full access to your ChaiAuth account and all our platform features.",
      ),
      ctaButton(url, "Go to Dashboard"),
    ].join(""),
    "Your account is now fully active.",
  );

export const passwordChangedEmail = () =>
  baseTemplate(
    "Security Alert: Password Changed",
    [
      icon("box-important--v1", "ef4444"),
      heading("Password changed"),
      paragraph("This is a confirmation that the password for your ChaiAuth account was recently updated."),
      `<div style="background-color: #271011; border: 1px solid #4a1516; padding: 16px; border-radius: 8px; text-align: left;">
        <p style="color: #fca5a5; font-size: 14px; margin: 0; font-weight: 500;">Security Alert: If you did not make this change, please contact our support team immediately to secure your account.</p>
      </div>`,
    ].join(""),
    "Notice regarding your recent password change.",
  );

export const developerAppRegisteredEmail = (appName: string, clientId: string) =>
  baseTemplate(
    "New App Registered",
    [
      icon("module", "f97316"),
      heading("App Registered Successfully"),
      paragraph("You have successfully registered a new OAuth App on the ChaiAuth Developer Platform.", 24),
      `<div style="background-color: #09090b; border: 1px solid #27272a; padding: 20px; border-radius: 8px; text-align: left; margin-bottom: 24px;">
        <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 8px 0;"><strong>App Name:</strong> <span style="color: #ffffff;">${escapeHtml(appName)}</span></p>
        <p style="color: #a1a1aa; font-size: 14px; margin: 0;"><strong>Client ID:</strong> <code style="color: #ea580c; font-family: monospace; background: #18181b; padding: 2px 6px; border-radius: 4px;">${escapeHtml(clientId)}</code></p>
      </div>`,
      `<div style="background-color: #1a1a1a; border: 1px solid #333333; padding: 16px; border-radius: 8px; text-align: left;">
        <p style="color: #e4e4e7; font-size: 14px; margin: 0;">Reminder: Keep your Client Secret completely secure. Never expose it in frontend code or public repositories.</p>
      </div>`,
    ].join(""),
    "Confirmation of your new OAuth application.",
  );

export const otpEmail = (otp: string, appName = "ChaiAuth") =>
  baseTemplate(
    "Your login code",
    [
      icon("key", "f97316"),
      heading("Your login code"),
      paragraph(
        `Use this one-time code to sign in to <strong style="color: #ffffff;">${escapeHtml(appName)}</strong>. This code expires in <strong style="color: #ffffff;">10 minutes</strong>.`,
      ),
      `<div style="background-color: #09090b; border: 1px solid #27272a; padding: 32px 24px; border-radius: 10px; text-align: center; margin-bottom: 32px;">
        <p style="color: #52525b; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 16px 0; font-weight: 600;">One-Time Password</p>
        <div style="letter-spacing: 12px; font-size: 44px; font-weight: 800; color: #f97316; font-family: 'Courier New', Courier, monospace;">${escapeHtml(otp)}</div>
      </div>`,
      `<div style="background-color: #1a0d00; border: 1px solid #431407; padding: 16px; border-radius: 8px; text-align: left;">
        <p style="color: #fdba74; font-size: 13px; margin: 0; line-height: 1.6;"><strong>Security notice:</strong> Never share this code with anyone. ${escapeHtml(appName)} staff will never ask for this OTP. If you did not request this code, you can safely ignore this email.</p>
      </div>`,
    ].join(""),
    `Your one-time login code: ${otp}`,
  );

export interface SuspiciousLoginDetails {
  device: string;
  location: string;
  time: string;
}

export const suspiciousLoginEmail = ({ device, location, time }: SuspiciousLoginDetails) =>
  baseTemplate(
    "New Login Alert",
    [
      heading("New Login Detected"),
      paragraph(
        "We noticed a login to your ChaiAuth account from a new device or location. If this was you, you can safely ignore this email.",
        24,
      ),
      infoCard(
        labeledValue("Device", device) + labeledValue("Location (IP)", location) + labeledValue("Time", time, true),
      ),
      paragraph(
        "If you did not authorize this login, please reset your password immediately and review your active sessions in the dashboard.",
        0,
      ),
    ].join(""),
    "We detected a login from a new device.",
  );

export const dataExportEmail = (url: string) =>
  baseTemplate(
    "Data Export Ready",
    [
      heading("Your Data Export is Ready"),
      paragraph(
        "You requested a copy of your ChaiAuth data. The file containing your profile, security settings, and session history is ready for download.",
        24,
      ),
      infoCard(
        `<p style="margin: 0 0 16px; font-size: 14px; color: #e4e4e7;">This secure link is valid for exactly <strong>24 hours</strong>. After that, you will need to request a new export.</p>${ctaButton(url, "Download Data Archive")}`,
      ),
      paragraph("If you did not request this, please ignore this email and review your account security settings.", 0),
    ].join(""),
    "Your requested data archive is ready for download.",
  );
