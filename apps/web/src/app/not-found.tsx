import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 ca-root dark">
      <div className="max-w-md text-center ca-fade-up">
        <h1 className="text-[5rem] font-bold text-foreground" style={{fontFamily: '"Sora", sans-serif'}}>404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground" style={{fontFamily: '"Sora", sans-serif'}}>Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="ca-btn ca-btn-primary"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
