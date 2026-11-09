import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { Metadata } from "next";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.resetPassword);

import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
