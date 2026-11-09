import { PageHeader } from "@/shared/components/PageHeader";
import { DashboardPageContent } from "@/features/dashboard/DashboardPageContent";
import { Metadata } from "next";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.dashboard);

export default function DashboardPage() {
  return (
    <div>
      <DashboardPageContent />
    </div>
  );
}
