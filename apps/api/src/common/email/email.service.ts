import { config } from "../config/env.config";
import { emailProvider } from "./email.provider";
import {
  dataExportEmail,
  magicLinkEmail,
  developerAppRegisteredEmail,
  otpEmail,
  passwordChangedEmail,
  resetPasswordEmail,
  suspiciousLoginEmail,
  verificationEmail,
  welcomeEmail,
  type SuspiciousLoginDetails,
} from "./templates/auth.email";

/**
 * Typed, intent-based email API. Callers say WHAT to send; building URLs,
 * subjects and HTML is this module's job.
 */
const frontendUrl = (path: string, token?: string) =>
  `${config.app.frontendUrl}${path}${token ? `?token=${encodeURIComponent(token)}` : ""}`;

export const emailService = {
  sendVerificationEmail: (to: string, token: string) =>
    emailProvider.send({
      to,
      subject: "Verify your ChaiAuth email",
      html: verificationEmail(frontendUrl("/verify-email", token)),
    }),

  sendResetPasswordEmail: (to: string, token: string) =>
    emailProvider.send({
      to,
      subject: "Reset your ChaiAuth password",
      html: resetPasswordEmail(frontendUrl("/reset-password", token)),
    }),

  sendWelcomeEmail: (to: string, name: string) =>
    emailProvider.send({
      to,
      subject: "Welcome to ChaiAuth",
      html: welcomeEmail(name, frontendUrl("/dashboard")),
    }),

  sendPasswordChangedEmail: (to: string) =>
    emailProvider.send({
      to,
      subject: "Your ChaiAuth password was changed",
      html: passwordChangedEmail(),
    }),

  sendDeveloperAppRegisteredEmail: (to: string, appName: string, clientId: string) =>
    emailProvider.send({
      to,
      subject: "Your ChaiAuth app is registered",
      html: developerAppRegisteredEmail(appName, clientId),
    }),

  sendMagicLinkEmail: (to: string, token: string) =>
    emailProvider.send({
      to,
      subject: "Your ChaiAuth sign-in link",
      html: magicLinkEmail(frontendUrl("/magic-link", token)),
    }),

  sendOtpEmail: (to: string, otp: string, appName?: string) =>
    emailProvider.send({
      to,
      subject: `${otp} is your ChaiAuth login code`,
      html: otpEmail(otp, appName),
    }),

  sendSuspiciousLoginEmail: (to: string, details: SuspiciousLoginDetails) =>
    emailProvider.send({
      to,
      subject: "New sign-in to your ChaiAuth account",
      html: suspiciousLoginEmail(details),
    }),

  sendDataExportEmail: (to: string, token: string) =>
    emailProvider.send({
      to,
      subject: "Your ChaiAuth data export is ready",
      html: dataExportEmail(`${config.app.apiUrl}/auth/export-data/download/${encodeURIComponent(token)}`),
    }),
};
