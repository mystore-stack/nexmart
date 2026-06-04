"use client";
// src/app/error.tsx
import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm mb-6">
        We hit an unexpected error. Please try again or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono mb-6">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary py-3 px-6">Try Again</button>
        <Link href="/" className="btn-outline py-3 px-6">Go Home</Link>
      </div>
    </div>
  );
}
