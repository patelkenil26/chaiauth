import { CheckEmailPageContent } from "@/features/auth/components/CheckEmailPageContent";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import Link from "next/link";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata = constructMetadata(pageMetadata.checkEmail);

export default function CheckEmailPage() {
  return (
    <AuthLayout
      title="Check your email"
      subtitle="We've sent a secure verification link to:"
      footer={
        <>
          Didn't receive the email? Check your spam folder or <br className="hidden sm:block" />
          <Link href="/register" className="text-primary hover:underline underline-offset-4 mt-1 font-medium">
            try registering again
          </Link>.
        </>
      }
    >
      <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <CheckEmailPageContent />
      </Suspense>
    </AuthLayout>
  );
}
