import { constructMetadata, pageMetadata } from "@/config/site";
import { DocsPageContent } from "@/features/docs/DocsPageContent";

export const metadata = constructMetadata(pageMetadata.docs);

export default function DocsPage() {
  return <DocsPageContent />;
}
