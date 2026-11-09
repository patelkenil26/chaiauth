"use client";

import React from "react";
import { SessionsCard } from "./components/SessionsCard";
import { SecurityActivityCard } from "./components/SecurityActivityCard";
import { PageHeader } from "@/shared/components/PageHeader";

export function SessionsPageContent() {
  return (
    <div>
      <PageHeader 
        eyebrow="Sessions & Devices"
        title="Active sessions & activity"
        description="Every device signed in to your account. Revoke anything you don't recognise."
      />
      <div className="ca-stagger space-y-5">
        <SessionsCard />
        <SecurityActivityCard />
      </div>
    </div>
  );
}
