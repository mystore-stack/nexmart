// src/components/home/BundleDealsSection.tsx
import { Bundle } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface BundleDealsSectionProps {
  bundles: Bundle[];
}

export function BundleDealsSection({ bundles }: BundleDealsSectionProps) {
  const hasBundles = bundles && bundles.length > 0;
  const featuredBundle = hasBundles ? bundles[0] : null;

  return (
    <section className="section bg-surface/60">
      <div className="container-main">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Save More</p>
            <h2 className="font-display text-2xl font-semibold text-foreground">Bundle Deals</h2>
          </div>
          <Link href="/bundles" className="text-sm font-semibold text-primary hover:underline">
            See all →
          </Link>
        </div>
        <div className="card-luxury rounded-2xl p-6">
          {featuredBundle ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                {featuredBundle.products.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-1 overflow-hidden rounded-xl bg-muted aspect-square relative">
                  <Image
                    src={p.images[0] || "/placeholder.jpg"}
                    alt={p.name}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                {i < featuredBundle.products.length - 1 && (
                  <span className="text-lg font-light text-muted-foreground">+</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{featuredBundle.name}</p>
              <p className="text-2xl font-bold text-foreground">
                {featuredBundle.bundlePrice.toLocaleString("fr-MA")} MAD
              </p>
              <p className="text-sm text-muted-foreground line-through">
                {featuredBundle.totalPrice.toLocaleString("fr-MA")} MAD
              </p>
            </div>
            <Link
              href={`/m/bundles/${featuredBundle.slug}`}
              className="btn btn-primary px-6 py-3 text-sm font-semibold"
            >
              Save {featuredBundle.discountPercentage}%
            </Link>
          </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">No bundles available at the moment</p>
          )}
        </div>
      </div>
    </section>
  );
}
