// src/app/api/admin/mystery-box/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, created, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    // For now, return mock mystery boxes since they don't exist in DB yet
    const mockBoxes = [
      {
        id: '1',
        name: 'Bronze Box',
        tier: 'bronze',
        price: 2990,
        stock: 250,
        valueLabel: 'Worth up to 5000 MAD',
        rewards: [
          { productId: '1', probability: 50, name: 'Argan Oil Premium 100ml', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200', value: 2499 },
          { productId: '3', probability: 30, name: 'Rose Water 100ml', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200', value: 499 },
          { productId: '5', probability: 20, name: 'Tagine Pot Traditional', image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=200', value: 3500 },
        ],
        totalSales: 1240,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Silver Box',
        tier: 'silver',
        price: 5990,
        stock: 120,
        valueLabel: 'Worth up to 12000 MAD',
        rewards: [
          { productId: '2', probability: 40, name: 'Moroccan Leather Bag', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200', value: 8990 },
          { productId: '1', probability: 35, name: 'Argan Oil Premium 100ml', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200', value: 2499 },
          { productId: '6', probability: 25, name: 'Moroccan Tea Set', image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200', value: 5990 },
        ],
        totalSales: 890,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Gold Box',
        tier: 'gold',
        price: 9990,
        stock: 45,
        valueLabel: 'Worth up to 25000 MAD',
        rewards: [
          { productId: '2', probability: 50, name: 'Moroccan Leather Bag', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200', value: 8990 },
          { productId: '4', probability: 30, name: 'Berber Carpet 2x3m', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200', value: 45000 },
          { productId: '5', probability: 20, name: 'Tagine Pot Traditional', image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=200', value: 3500 },
        ],
        totalSales: 420,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Platinum Box',
        tier: 'platinum',
        price: 19990,
        stock: 15,
        valueLabel: 'Worth up to 50000 MAD',
        rewards: [
          { productId: '4', probability: 45, name: 'Berber Carpet 2x3m', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200', value: 45000 },
          { productId: '2', probability: 35, name: 'Moroccan Leather Bag', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200', value: 8990 },
          { productId: '6', probability: 20, name: 'Moroccan Tea Set', image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200', value: 5990 },
        ],
        totalSales: 85,
        active: false,
        createdAt: new Date().toISOString(),
      },
    ];
    
    return ok({ data: mockBoxes });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const body = await req.json();
    
    // TODO: Implement mystery box creation in database
    return created({ id: Date.now().toString(), ...body });
  } catch (err) {
    return handleApiError(err);
  }
}
