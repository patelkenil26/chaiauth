import { SessionsPageContent } from "@/features/dashboard/SessionsPageContent";
import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata = constructMetadata(pageMetadata.dashboardSessions);

export default function SessionsPage() {
  return <SessionsPageContent />;
}
