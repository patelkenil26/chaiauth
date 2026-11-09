"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 ca-root dark">
      <div className="max-w-md text-center ca-fade-up flex flex-col items-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-[2.2rem] font-bold text-foreground" style={{fontFamily: '"Sora", sans-serif'}}>
          Something went wrong
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          We encountered an unexpected error. Don't worry, it's on us. Please try again or return to the home page.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 w-full">
          <button
            onClick={() => reset()}
            className="ca-btn ca-btn-primary flex-1"
          >
            Try again
          </button>
          <Link
            href="/"
            className="ca-btn ca-btn-ghost flex-1"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
