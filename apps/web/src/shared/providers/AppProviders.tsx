"use client";

import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/shared/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {/* We force the theme to dark and disable system sync as per your requirement */}
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        forcedTheme="dark"
      >
        {children}
        {/* Toaster is placed here so it's available on every page and gets the dark theme */}
        <Toaster />
      </ThemeProvider>
    </QueryProvider>
  );
}
