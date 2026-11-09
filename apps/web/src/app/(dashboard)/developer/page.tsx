import { PageHeader } from "@/shared/components/PageHeader";
import { DeveloperPageContent } from "@/features/developer/DeveloperPageContent";
import { Metadata } from "next";

import { constructMetadata, pageMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata(pageMetadata.developer);

export default function DeveloperPage() {
  return (
    <div>
      <PageHeader eyebrow="Developer tools" title="Applications" />
      <DeveloperPageContent />
    </div>
  );
}
