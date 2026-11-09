import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { LoginErrorToast } from "@/features/auth/components/LoginErrorToast";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.login);

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your ChaiAuth account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginErrorToast />
      </Suspense>
      <LoginForm />
    </AuthLayout>
  );
}
