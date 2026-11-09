import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { MagicLinkVerifyContent } from "@/features/auth/components/MagicLinkVerifyContent";
import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.magicLink);

export default function MagicLinkPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <MagicLinkVerifyContent />
      </Suspense>
    </AuthLayout>
  );
}
