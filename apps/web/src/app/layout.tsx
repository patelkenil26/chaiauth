import type { Metadata } from "next";
import "./globals.css";
import { siteConfig, constructMetadata } from "@/config/site";
import { AppProviders } from "@/shared/providers/AppProviders";

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`antialiased min-h-screen bg-background font-sans`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
