import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/shared/components/Logo";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata = constructMetadata(pageMetadata.terms);

export default function TermsAndConditionsPage() {
  return (
    <div className="ca-root dark min-h-screen">
      <div className="ca-grid pointer-events-none fixed inset-0" />
      <div className="relative mx-auto max-w-3xl px-6 py-12 sm:px-10">
        <header className="mb-12 flex items-center justify-between">
          <Logo />
          <Link href="/" className="ca-btn ca-btn-ghost text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>
        </header>

        <main className="prose prose-invert prose-slate max-w-none">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground mt-2">Last updated: September 2026</p>

          <div className="mt-10 space-y-8 text-text-soft">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using ChaiAuth ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service. We reserve the right to update and change these Terms at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Account Registration</h2>
              <p className="mb-4">
                You must provide a valid email address and secure password, or a secure Passkey, to create and access an account. We strongly recommend enabling Two-Factor Authentication (TOTP) for added security. You are responsible for maintaining the security of your account credentials. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Developer Portal and API Usage</h2>
              <p className="mb-4">
                Users may access the Developer Portal to register OAuth clients and integrate ChaiAuth authentication into their own applications. You agree to use the API responsibly. We reserve the right to suspend or delete OAuth clients that are used for malicious purposes, spam, or that attempt to compromise the security of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Intellectual Property</h2>
              <p className="mb-4">
                All content, features, and functionality of the Service are owned by ChaiAuth and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Disclaimer of Warranties</h2>
              <p className="mb-4">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties of any kind, whether express or implied, including without limitation the warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
