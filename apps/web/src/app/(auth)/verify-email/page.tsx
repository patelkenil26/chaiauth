import { VerifyEmailPageContent } from "@/features/auth/components/VerifyEmailPageContent";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { Metadata } from "next";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.verifyEmail);

import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <VerifyEmailPageContent />
      </Suspense>
    </AuthLayout>
  );
}
