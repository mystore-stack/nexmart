// src/app/api/admin/bundles/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, created, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    // For now, return mock bundles since bundles don't exist in DB yet
    const mockBundles = [
      {
        id: '1',
        name: 'Moroccan Beauty Essentials',
        products: [
          { id: '1', name: 'Argan Oil Premium 100ml', price: 2499, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200' },
          { id: '3', name: 'Rose Water 100ml', price: 499, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200' },
          { id: '5', name: 'Tagine Pot Traditional', price: 3500, image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=200' },
        ],
        regularPrice: 6498,
        bundlePrice: 4990,
        discount: 23,
        sales: 240,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Home Comfort Set',
        products: [
          { id: '5', name: 'Tagine Pot Traditional', price: 3500, image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=200' },
          { id: '4', name: 'Berber Carpet 2x3m', price: 45000, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200' },
          { id: '6', name: 'Moroccan Tea Set', price: 5990, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200' },
        ],
        regularPrice: 54490,
        bundlePrice: 39990,
        discount: 27,
        sales: 87,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Luxury Fashion Bundle',
        products: [
          { id: '2', name: 'Moroccan Leather Bag', price: 8990, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200' },
          { id: '5', name: 'Tagine Pot Traditional', price: 3500, image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=200' },
          { id: '6', name: 'Moroccan Tea Set', price: 5990, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200' },
        ],
        regularPrice: 18480,
        bundlePrice: 12990,
        discount: 30,
        sales: 156,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    
    return ok({ data: mockBundles });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const body = await req.json();
    
    // TODO: Implement bundle creation in database
    // For now, return the created bundle
    return created({ id: Date.now().toString(), ...body });
  } catch (err) {
    return handleApiError(err);
  }
}
