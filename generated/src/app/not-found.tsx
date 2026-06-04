// src/app/not-found.tsx
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 rounded-3xl bg-foreground flex items-center justify-center mx-auto mb-6">
        <span className="text-background font-black text-4xl font-display">N</span>
      </div>
      <h1 className="text-6xl font-bold mb-3">404</h1>
      <h2 className="text-2xl font-semibold mb-3">Page not found</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
We couldn&apos;t find the page you were looking for. It may have been moved or deleted.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary py-3 px-6">Go Home</Link>
        <Link href="/products" className="btn-outline py-3 px-6">Browse Products</Link>
      </div>
    </div>
  );
}
