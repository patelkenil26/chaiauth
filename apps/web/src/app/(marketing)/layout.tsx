import { MarketingNavbar } from "@/features/marketing/components/MarketingNavbar";
import { MarketingFooter } from "@/features/marketing/components/MarketingFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ca-root dark flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
