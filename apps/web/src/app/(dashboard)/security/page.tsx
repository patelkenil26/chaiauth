import { SecurityPageContent } from "@/features/dashboard/SecurityPageContent";
import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata = constructMetadata(pageMetadata.dashboardSecurity);

export default function SecurityPage() {
  return <SecurityPageContent />;
}
