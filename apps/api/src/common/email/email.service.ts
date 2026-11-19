import { config } from "../config/env.config";
import { chaiAuthBrand, type EmailBrand } from "./brand";
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

/**
 * Links go to the brand's own site: an app that sends its users through ChaiAuth's embedded forms
 * hosts `/verify-email` and `/reset-password` pages itself, so nothing ever shows "ChaiAuth".
 */
const linkFor = (brand: EmailBrand | undefined, path: string, token: string) =>
  brand?.isApp ? `${brand.url}${path}?token=${encodeURIComponent(token)}` : frontendUrl(path, token);

const nameOf = (brand?: EmailBrand) => (brand ?? chaiAuthBrand()).name;
const fromOf = (brand?: EmailBrand) => (brand?.isApp ? brand.fromName : undefined);

export const emailService = {
  sendVerificationEmail: (to: string, token: string, brand?: EmailBrand) =>
    emailProvider.send({
      to,
      fromName: fromOf(brand),
      subject: `Verify your ${nameOf(brand)} email`,
      html: verificationEmail(linkFor(brand, "/verify-email", token), brand),
    }),

  sendResetPasswordEmail: (to: string, token: string, brand?: EmailBrand) =>
    emailProvider.send({
      to,
      fromName: fromOf(brand),
      subject: `Reset your ${nameOf(brand)} password`,
      html: resetPasswordEmail(linkFor(brand, "/reset-password", token), brand),
    }),

  sendWelcomeEmail: (to: string, name: string, brand?: EmailBrand) =>
    emailProvider.send({
      to,
      fromName: fromOf(brand),
      subject: `Welcome to ${nameOf(brand)}`,
      html: welcomeEmail(name, brand?.isApp ? brand.url : frontendUrl("/dashboard"), brand),
    }),

  sendPasswordChangedEmail: (to: string, brand?: EmailBrand) =>
    emailProvider.send({
      to,
      fromName: fromOf(brand),
      subject: `Your ${nameOf(brand)} password was changed`,
      html: passwordChangedEmail(brand),
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

  sendOtpEmail: (to: string, otp: string, brand?: EmailBrand) =>
    emailProvider.send({
      to,
      fromName: fromOf(brand),
      subject: `${otp} is your ${nameOf(brand)} login code`,
      html: otpEmail(otp, brand),
    }),

  sendSuspiciousLoginEmail: (to: string, details: SuspiciousLoginDetails, brand?: EmailBrand) =>
    emailProvider.send({
      to,
      fromName: fromOf(brand),
      subject: `New sign-in to your ${nameOf(brand)} account`,
      html: suspiciousLoginEmail(details, brand),
    }),

  sendDataExportEmail: (to: string, token: string) =>
    emailProvider.send({
      to,
      subject: "Your ChaiAuth data export is ready",
      html: dataExportEmail(`${config.app.apiUrl}/auth/export-data/download/${encodeURIComponent(token)}`),
    }),
};
