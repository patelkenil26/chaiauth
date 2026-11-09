"use client";

import React from "react";
import { Mail, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function CheckEmailPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // Logic to determine email provider URL
  let providerUrl = "";
  let providerName = "";

  if (email.endsWith("@gmail.com")) {
    providerUrl = "https://mail.google.com/mail/u/0/#search/from%3Aonboarding%40resend.dev";
    providerName = "Gmail";
  } else if (email.endsWith("@outlook.com") || email.endsWith("@hotmail.com")) {
    providerUrl = "https://outlook.live.com/mail/0/inbox";
    providerName = "Outlook";
  } else if (email.endsWith("@yahoo.com")) {
    providerUrl = "https://mail.yahoo.com/d/folders/1";
    providerName = "Yahoo";
  }

  return (
    <div className="text-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-12 w-12" />
        </div>
        
        <p className="mt-2 text-[15px] leading-6 text-foreground max-w-sm mx-auto font-medium">
          {email || "your email address"}
        </p>

        <div className="w-full max-w-sm space-y-3 pt-2">
          {providerUrl ? (
            <a 
              href={providerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ca-btn ca-btn-primary w-full text-base font-semibold h-12"
            >
              Open {providerName} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          ) : (
            <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">
                Please open your email client to verify your account.
              </p>
            </div>
          )}
          
          <Link href="/login" className="ca-btn ca-btn-ghost w-full text-sm mt-4">
            Back to login <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
