"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Product page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container-main py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>

          <h1 className="font-display text-3xl font-semibold mb-4">
            Product Error
          </h1>

          <p className="text-muted-foreground mb-8">
            We encountered an error while loading this product. This might be a temporary issue.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>

            <Link
              href="/products"
              className="px-6 py-3 bg-card border border-border font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Products
            </Link>

            <Link
              href="/"
              className="px-6 py-3 bg-card border border-border font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-muted rounded-lg text-left">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
