export const siteConfig = {
  name: "ChaiAuth",
  description: "Authentication system built with Next.js, Drizzle and PostgreSQL",
};

export type SiteConfig = typeof siteConfig;

import { Metadata } from "next";

export function constructMetadata({
  title,
  description = siteConfig.description,
}: {
  title?: string;
  description?: string;
} = {}): Metadata {
  return {
    title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
    description,
  };
}

export const pageMetadata = {
  dashboard: { title: "Profile", description: "Manage your personal profile and preferences." },
  dashboardSecurity: { title: "Security", description: "Manage your password, MFA, and passkeys." },
  dashboardSessions: { title: "Sessions & Devices", description: "View your active sessions and security activity." },
  developer: { title: "Developer Console", description: "Manage ChaiAuth application credentials and callback URLs." },
  login: { title: "Sign in", description: "Sign in to your ChaiAuth account to manage your identity and connected apps." },
  register: { title: "Create an account", description: "Create your ChaiAuth account as a customer or seller in under a minute." },
  authorize: { title: "Authorize Application", description: "Authorize third-party application access to your account" },
  verifyEmail: { title: "Verify Email", description: "Verifying your email address" },
  resetPassword: { title: "Reset Password", description: "Set a new password for your account" },
  forgotPassword: { title: "Reset your password", description: "Request a secure link to reset your ChaiAuth password." },
  checkEmail: { title: "Check your email" },
  terms: { title: "Terms and Conditions", description: "Terms and Conditions for using ChaiAuth services." },
  privacy: { title: "Privacy Policy", description: "Privacy Policy and data practices for ChaiAuth." },
  docs: { title: "Documentation", description: "Learn how to integrate ChaiAuth into your application." },
};
