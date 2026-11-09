import React from "react";
import { MailWarning } from "lucide-react";
import { toast } from "sonner";

interface VerifyEmailAlertProps {
  email: string;
  isPendingChange?: boolean;
}

export function VerifyEmailAlert({ email, isPendingChange }: VerifyEmailAlertProps) {
  return (
    <section className="flex flex-col gap-4 rounded-md border border-primary/40 bg-accent p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <MailWarning className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold text-foreground">
            {isPendingChange ? "Verify your new email" : "Verify your email"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPendingChange 
              ? `A verification link was sent to ${email}. Valid for 15 minutes.`
              : `Confirm ${email} to secure recovery and app access.`}
          </p>
        </div>
      </div>
      <button 
        onClick={() => toast.info("Verification sent!")} 
        className="ca-btn ca-btn-primary whitespace-nowrap"
      >
        Verify now
      </button>
    </section>
  );
}
