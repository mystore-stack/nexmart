"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ORDER_DETAIL_ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          
          <p className="text-muted-foreground mb-6">
            We encountered an error while loading your order details. Please try again or contact support if the problem persists.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Error details:</p>
              <p className="text-xs text-red-700 dark:text-red-400 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                    Show stack trace
                  </summary>
                  <pre className="text-xs text-red-700 dark:text-red-400 mt-2 overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="btn-primary flex items-center justify-center gap-2 py-3 px-6"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/orders"
              className="btn-outline flex items-center justify-center gap-2 py-3 px-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Error ID: {error.digest || "unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
