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
      />
      <div className="grid gap-5 xl:grid-cols-[1fr] ca-fade-up max-w-4xl">
        <div className="space-y-5">
          <SessionsCard />
          <SecurityActivityCard />
        </div>
      </div>
    </div>
  );
}
