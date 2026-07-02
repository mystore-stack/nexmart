import Link from "next/link";

export default function BundleNotFound() {
  return (
    <div className="container-main py-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none" className="opacity-30">
              <path d="M50 5 L95 50 L50 95 L5 50 Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              <path d="M50 20 L80 50 L50 80 L20 50 Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
              <path d="M50 35 L65 50 L50 65 L35 50 Z" stroke="#0F766E" strokeWidth="1" fill="none" />
              <circle cx="50" cy="50" r="8" fill="rgba(212,175,55,0.4)" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-4">Bundle Not Found</h1>
          <p className="text-xl text-muted-foreground mb-2">
            This bundle does not exist or has been removed
          </p>
          <p className="text-muted-foreground mb-8">
            The bundle you're looking for might have been discontinued or the link is incorrect.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-primary h-12 px-8">
            Return to Home
          </Link>
          <Link href="/products" className="btn-outline h-12 px-8">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
