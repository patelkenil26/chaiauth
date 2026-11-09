import { Metadata } from "next";
import { DashboardLayoutClient } from "@/shared/layouts/DashboardLayoutClient";

import { constructMetadata } from "@/config/site";

export const metadata: Metadata = constructMetadata({
  title: "Dashboard",
  description: "Manage your ChaiAuth profile and security.",
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
