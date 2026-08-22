"use client";

import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface BundleDealsClientPageProps {
  bundleDeals: any[];
}

export function BundleDealsClientPage({ bundleDeals }: BundleDealsClientPageProps) {
  const { addBundleDeal } = useCartStore();
  const router = useRouter();

  const handleAddToCart = (bundle: any, openCart: boolean = true) => {
    console.log("[BUNDLE DEALS] CLICK");
    console.log("[BUNDLE DEALS] ADDING TO CART");
    try {
      addBundleDeal(bundle, 1, openCart);
      console.log("[BUNDLE DEALS] AFTER ADD");
      
      console.log("[BUNDLE DEALS] ROUTER INSTANCE", router);
      
      toast.success(`${bundle.name} added to cart! ${openCart ? '' : 'Redirecting to checkout...'}`, {
        duration: 2000,
      });
      
      if (!openCart) {
        console.log("[BUNDLE DEALS] BEFORE PUSH");
        console.log("[BUNDLE DEALS] NAVIGATING TO: /checkout");
        const result = router.push('/checkout');
        console.log("[BUNDLE DEALS] AFTER PUSH", result);
      }
    } catch (error) {
      console.error('[BUNDLE DEALS] Error adding bundle to cart:', error);
      toast.error('Failed to add bundle to cart');
    }
  };

  const handleBuyNow = (bundle: any) => {
    console.log("[BUY NOW] handleBuyNow called", bundle);
    handleAddToCart(bundle, false); // Don't open cart for Buy Now
  };

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
        <div className="container-main py-20 md:py-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <span className="w-4 h-4">🛍️</span>
              Limited Time Offers
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
              Bundle Deals
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium mb-8 max-w-2xl mx-auto">
              Save up to 40% when you buy products together. Discover amazing bundles curated just for you.
            </p>
            <a
              href="#bundles"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-2xl"
            >
              Shop Bundles
              <span className="w-5 h-5">🛒</span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Bundle Deals Section */}
      <section id="bundles" className="py-16 md:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Featured <span className="gradient-emerald">Bundle Deals</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Handpicked bundles to help you save more on your favorite products
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundleDeals.map((bundle) => {
              const originalPrice = bundle.products.reduce((sum: number, bp: any) => sum + (bp.product?.price || 0), 0);
              const savings = originalPrice - bundle.bundlePrice;
              
              return (
                <div
                  key={bundle.id}
                  className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden" style={{ backgroundColor: bundle.backgroundColor || "#ffffff" }}>
                    {bundle.image ? (
                      <img
                        src={bundle.image}
                        alt={bundle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="w-16 h-16 text-muted-foreground">🛍️</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      -{Math.round(bundle.discountPercent)}%
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">
                      {bundle.name}
                    </h3>

                    {/* Products */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Includes {bundle.products.length} products:</p>
                      <div className="flex flex-wrap gap-2">
                        {bundle.products.slice(0, 4).map((bp: any) => (
                          <span
                            key={bp.id}
                            className="px-2 py-1 bg-muted text-xs rounded-full"
                          >
                            {bp.product?.name || "Product"}
                          </span>
                        ))}
                        {bundle.products.length > 4 && (
                          <span className="px-2 py-1 bg-muted text-xs rounded-full">
                            +{bundle.products.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-bold gradient-emerald">
                        {bundle.bundlePrice.toLocaleString()} MAD
                      </span>
                      <span className="text-lg text-muted-foreground line-through">
                        {originalPrice.toLocaleString()} MAD
                      </span>
                    </div>

                    {/* Savings */}
                    <div className="text-sm text-emerald-600 font-semibold mb-4">
                      You save {savings.toLocaleString()} MAD
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleAddToCart(bundle)}
                        className="flex-1 px-4 py-3 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={() => {
                          console.log("[BUY NOW BUTTON] Clicked", bundle);
                          handleBuyNow(bundle);
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-surface/50">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Browse by <span className="gradient-emerald">Category</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Find bundles in your favorite categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Electronics", icon: "💻", count: 24 },
              { name: "Fashion", icon: "👗", count: 18 },
              { name: "Home", icon: "🏠", count: 15 },
              { name: "Beauty", icon: "💄", count: 12 },
              { name: "Sports", icon: "⚽", count: 9 },
              { name: "Gaming", icon: "🎮", count: 21 }
            ].map((category) => (
              <a
                key={category.name}
                href="#"
                className="group bg-background border border-border rounded-xl p-6 text-center hover:border-emerald-500/50 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold mb-1 group-hover:text-emerald-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">{category.count} bundles</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Buy Bundles Section */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Why Buy <span className="gradient-emerald">Bundles?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover the advantages of shopping with our curated bundles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🏷️", title: "Better Prices", description: "Save up to 40% when you buy products together in bundles" },
              { icon: "🚚", title: "Free Shipping", description: "All bundle deals come with free shipping across Morocco" },
              { icon: "🛡️", title: "Premium Quality", description: "Every product in our bundles is carefully selected for quality" },
              { icon: "⚡", title: "Fast Delivery", description: "Get your bundle delivered within 2-3 business days" }
            ].map((benefit, index) => (
              <div
                key={index}
                className="text-center p-8 bg-surface border border-border rounded-2xl hover:border-emerald-500/50 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r gradient-emerald flex items-center justify-center text-2xl">
                  {benefit.icon}
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
        <div className="container-main relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Get Exclusive Bundle Deals
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Subscribe to our newsletter and be the first to know about new bundle deals and exclusive discounts.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
              >
                Subscribe
              </button>
            </form>
            <p className="text-white/70 text-sm mt-4">
              No spam, unsubscribe anytime. Join 50,000+ happy customers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
