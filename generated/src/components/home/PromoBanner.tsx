// src/components/home/PromoBanner.tsx
import Link from "next/link";

export function PromoBanner() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 bg-card border border-border rounded-3xl p-8 shadow-card">
      <div className="lg:col-span-2 space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Limited time</p>
        <h2 className="text-3xl md:text-4xl font-bold">Explore the best of NexMart</h2>
        <p className="text-muted-foreground max-w-2xl">
          Discover curated collections, exclusive deals, and handcrafted favorites from across Morocco.
        </p>
      </div>
      <div className="flex items-center justify-center">
        <Link href="/products" className="btn-brand px-6 py-4 text-sm">
          Shop Now
        </Link>
      </div>
    </div>
  );
}
