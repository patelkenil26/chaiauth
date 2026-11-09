import { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.register);

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start with a secure identity you can use everywhere."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
