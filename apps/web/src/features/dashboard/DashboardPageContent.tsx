"use client";

import React from "react";
import { VerifyEmailAlert } from "./components/VerifyEmailAlert";
import { ProfileDetailsCard } from "./components/ProfileDetailsCard";
import { ProfileSettingsCard } from "./components/ProfileSettingsCard";
import { ExportDataCard } from "./components/ExportDataCard";
import { AccountHealthCard } from "./components/AccountHealthCard";
import { QuickActions } from "./components/QuickActions";
import { DeleteAccountCard } from "./components/DeleteAccountCard";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/shared/components/PageHeader";

import { useUserProfile } from "./hooks/useUserProfile";

export function DashboardPageContent() {
  const { data: user, isLoading } = useUserProfile();

  if (!user && isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If failed to load and no cached user
  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Unable to load user data. Please try logging in again.
      </div>
    );
  }

  const firstName = user.name ? user.name.split(" ")[0] : "User";

  return (
    <div>
      <PageHeader
        eyebrow="Account overview"
        title={`Welcome back, ${firstName}`}
        description="Your profile, security health and shortcuts in one place."
      />
      <div className="ca-stagger space-y-5">
        {!user.isVerified && !user.pendingEmail && <VerifyEmailAlert email={user.email} />}
        {user.pendingEmail && <VerifyEmailAlert email={user.pendingEmail} isPendingChange={true} />}
        <ProfileDetailsCard user={user} />
        <QuickActions />
        <AccountHealthCard user={user} />
        <ProfileSettingsCard user={user} />
        <ExportDataCard />
        <DeleteAccountCard />
      </div>
    </div>
  );
}
