import { Metadata } from "next";
import { ForgotPasswordPageContent } from "@/features/auth/components/ForgotPasswordPageContent";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.forgotPassword);

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}
