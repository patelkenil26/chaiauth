import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/shared/components/Logo";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata = constructMetadata(pageMetadata.privacy);

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-2">Last updated: September 2026</p>

          <div className="mt-10 space-y-8 text-text-soft">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information we collect</h2>
              <p className="mb-4">
                We collect information you provide directly to us when you create an account, register an OAuth application, or communicate with us. This information is strictly limited to: your full name, email address, phone number (optional), password (securely hashed), and your account role. We also collect device session data (IP address, browser, OS) for active session management, and public cryptographic keys if you register a Passkey (WebAuthn). We do not collect or store biometric data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use of information</h2>
              <p className="mb-4">
                We use the information we collect strictly to operate the ChaiAuth service. Specifically, to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide authentication and authorization services for your account.</li>
                <li>Manage your registered OAuth applications and client credentials.</li>
                <li>Send essential account communications, such as password reset links or email verification codes.</li>
                <li>Ensure the security and integrity of our platform.</li>
              </ul>
              <p className="mt-4">
                <strong>We do not sell your data, and we do not use it for targeted advertising.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Security</h2>
              <p className="mb-4">
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. We encrypt all sensitive data in transit and at rest using industry-standard protocols.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cookies and Web Beacons</h2>
              <p className="mb-4">
                We use cookies and other tracking technologies to collect information about you and your interaction with our Services. Cookies are small data files stored on your hard drive or in device memory that help us improve our Services and your experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@chaiauth.com" className="text-primary hover:underline">privacy@chaiauth.com</a>.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
