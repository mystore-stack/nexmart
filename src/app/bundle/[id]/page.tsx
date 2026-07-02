import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

interface BundlePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const organizationId = await getDefaultOrganizationId();
  const bundle = await (prisma as any).bundleDeal.findFirst({
    where: { 
      id: params.id,
      organizationId,
    },
  });

  if (!bundle) {
    return {
      title: "Bundle Not Found",
    };
  }

  return {
    title: `${bundle.name} | Bundle Deal`,
    description: bundle.description,
  };
}

export default async function BundlePage({ params }: BundlePageProps) {
  const organizationId = await getDefaultOrganizationId();
  const bundle = await (prisma as any).bundleDeal.findFirst({
    where: { 
      id: params.id,
      organizationId,
    },
    include: {
      products: {
        include: {
          product: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!bundle) {
    notFound();
  }

  if (!bundle.enabled) {
    notFound();
  }

  const validProducts = bundle.products.filter((bp: any) => bp.product);

  return (
    <div className="container-main py-12">
      <div className="max-w-4xl mx-auto">
        {/* Bundle Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{bundle.name}</h1>
          {bundle.description && (
            <p className="text-lg text-muted-foreground">{bundle.description}</p>
          )}
        </div>

        {/* Bundle Pricing */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bundle Price</p>
              <p className="text-3xl font-bold">{bundle.bundlePrice.toFixed(2)} MAD</p>
              {bundle.discountPercent > 0 && (
                <p className="text-sm text-green-500 mt-1">
                  Save {bundle.discountPercent}%
                </p>
              )}
            </div>
            {bundle.buttonUrl ? (
              <a
                href={bundle.buttonUrl}
                className="btn-primary px-6 py-3"
              >
                {bundle.buttonText || "Buy Bundle"}
              </a>
            ) : (
              <button className="btn-primary px-6 py-3">
                {bundle.buttonText || "Buy Bundle"}
              </button>
            )}
          </div>
        </div>

        {/* Bundle Products */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Included Products</h2>
          {validProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products available in this bundle
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validProducts.map((bp: any) => (
                <div
                  key={bp.id}
                  className="bg-card border border-border rounded-xl p-4 flex gap-4"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {bp.product.images && bp.product.images[0] ? (
                      <img
                        src={bp.product.images[0]}
                        alt={bp.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{bp.product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {bp.product.price.toFixed(2)} MAD
                    </p>
                    <a
                      href={`/products/${bp.product.slug}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Product
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
