import { ConsentScreen } from "@/features/auth/components/ConsentScreen";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { Metadata } from "next";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.authorize);

import { Suspense } from "react";

export default function AuthorizePage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <ConsentScreen />
      </Suspense>
    </AuthLayout>
  );
}
