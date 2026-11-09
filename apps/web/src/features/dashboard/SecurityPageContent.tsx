"use client";

import React from "react";
import { UpdatePasswordForm } from "./components/UpdatePasswordForm";
import { PasskeyRegistrationCard } from "./components/PasskeyRegistrationCard";
import { MfaSettingsCard } from "./components/MfaSettingsCard";
import { PageHeader } from "@/shared/components/PageHeader";
import { useUserProfile } from "./hooks/useUserProfile";
import { Loader2 } from "lucide-react";

export function SecurityPageContent() {
  const { data: user, isLoading } = useUserProfile();

  if (!user && isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Unable to load user data. Please try logging in again.
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        eyebrow="Security & Authentication" 
        title="Manage your security" 
      />
      <div className="grid gap-5 xl:grid-cols-[1fr] ca-fade-up max-w-4xl">
        <div className="space-y-5">
          <UpdatePasswordForm />
          <MfaSettingsCard user={user} />
          <PasskeyRegistrationCard />
        </div>
      </div>
    </div>
  );
}
