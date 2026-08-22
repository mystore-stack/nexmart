import type { Metadata } from "next";
import { ShoppingBag, Tag, Truck, Shield, Zap, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { BundleDealsClientPage } from "./BundleDealsClientPage";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getBundleDealsData(organizationId: string) {
  try {
    const bundleDeals = await prisma.bundleDeal.findMany({
      where: {
        organizationId,
        isVisible: true,
        isPublished: true,
      },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return bundleDeals.filter((deal) =>
      deal.products.some((bp) => bp.product && bp.product.published)
    );
  } catch (error) {
    console.error("[BUNDLES_PAGE] Error fetching bundle deals:", error);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Bundle Deals | Save More with NexMart",
    description: "Discover amazing bundle deals at NexMart. Save up to 40% when you buy products together. Free shipping on all bundles.",
    keywords: ["bundle deals", "save money", "discount bundles", "NexMart bundles", "shopping bundles"],
    openGraph: {
      title: "Bundle Deals | Save More with NexMart",
      description: "Discover amazing bundle deals and save up to 40% when you buy products together.",
      type: "website",
    },
  };
}

// Mock data for bundle deals
const bundleDeals = [
  {
    id: 1,
    name: "Premium Tech Starter Kit",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
    originalPrice: 2999,
    discountedPrice: 1799,
    discount: 40,
    rating: 4.8,
    reviewCount: 124,
    products: [
      "Wireless Headphones",
      "Phone Case",
      "Screen Protector",
      "Charging Cable"
    ],
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Home Office Essentials",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop",
    originalPrice: 4599,
    discountedPrice: 2899,
    discount: 37,
    rating: 4.9,
    reviewCount: 89,
    products: [
      "Ergonomic Chair",
      "Desk Lamp",
      "Mouse Pad",
      "USB Hub"
    ],
    badge: "Popular"
  },
  {
    id: 3,
    name: "Fitness & Wellness Bundle",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
    originalPrice: 1999,
    discountedPrice: 1299,
    discount: 35,
    rating: 4.7,
    reviewCount: 156,
    products: [
      "Yoga Mat",
      "Resistance Bands",
      "Water Bottle",
      "Fitness Tracker"
    ],
    badge: "Limited Time"
  },
  {
    id: 4,
    name: "Kitchen Essentials Pack",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
    originalPrice: 1599,
    discountedPrice: 999,
    discount: 38,
    rating: 4.6,
    reviewCount: 203,
    products: [
      "Knife Set",
      "Cutting Board",
      "Measuring Cups",
      "Spatula Set"
    ],
    badge: null
  },
  {
    id: 5,
    name: "Gaming Starter Bundle",
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&h=600&fit=crop",
    originalPrice: 3999,
    discountedPrice: 2499,
    discount: 38,
    rating: 4.9,
    reviewCount: 312,
    products: [
      "Gaming Mouse",
      "Keyboard",
      "Headset",
      "Mouse Pad"
    ],
    badge: "Hot Deal"
  },
  {
    id: 6,
    name: "Photography Kit",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
    originalPrice: 5999,
    discountedPrice: 3799,
    discount: 37,
    rating: 4.8,
    reviewCount: 78,
    products: [
      "Tripod",
      "Lens Kit",
      "Camera Bag",
      "Memory Card"
    ],
    badge: "Premium"
  }
];

const categories = [
  { name: "Electronics", icon: "💻", count: 24 },
  { name: "Fashion", icon: "👗", count: 18 },
  { name: "Home", icon: "🏠", count: 15 },
  { name: "Beauty", icon: "💄", count: 12 },
  { name: "Sports", icon: "⚽", count: 9 },
  { name: "Gaming", icon: "🎮", count: 21 }
];

const benefits = [
  {
    icon: Tag,
    title: "Better Prices",
    description: "Save up to 40% when you buy products together in bundles"
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "All bundle deals come with free shipping across Morocco"
  },
  {
    icon: Shield,
    title: "Premium Quality",
    description: "Every product in our bundles is carefully selected for quality"
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Get your bundle delivered within 2-3 business days"
  }
];

export default async function BundleDealsPage() {
  const organizationId = await getDefaultOrganizationId();
  const bundleDeals = await getBundleDealsData(organizationId);

  return (
    <BundleDealsClientPage bundleDeals={bundleDeals} />
  );
}
