// src/app/api/admin/intents/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, created, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    // For now, return mock intents since they don't exist in DB yet
    const mockIntents = [
      {
        id: '1',
        title: 'Gaming Setup',
        icon: '🎮',
        description: 'Complete gaming equipment bundle',
        categories: ['Electronics', 'Fashion'],
        products: ['1', '2', '3'],
        color: 'from-purple-500 to-indigo-600',
        autoBundles: 3,
        suggestedProducts: 8,
        createdAt: '2024-01-10',
        active: true,
      },
      {
        id: '2',
        title: 'Home Office',
        icon: '💼',
        description: 'Workspace essentials for remote workers',
        categories: ['Home & Garden', 'Electronics'],
        products: ['4', '5', '6'],
        color: 'from-blue-500 to-cyan-600',
        autoBundles: 5,
        suggestedProducts: 12,
        createdAt: '2024-01-12',
        active: true,
      },
      {
        id: '3',
        title: 'Self-Care Box',
        icon: '🧖',
        description: 'Relaxation and beauty products',
        categories: ['Beauty & Personal Care', 'Home & Garden'],
        products: ['1', '3', '6'],
        color: 'from-pink-500 to-rose-600',
        autoBundles: 4,
        suggestedProducts: 15,
        createdAt: '2024-01-08',
        active: true,
      },
      {
        id: '4',
        title: 'Travel Essentials',
        icon: '✈️',
        description: 'Must-have items for travelers',
        categories: ['Fashion', 'Beauty & Personal Care'],
        products: ['2', '5'],
        color: 'from-orange-500 to-amber-600',
        autoBundles: 2,
        suggestedProducts: 10,
        createdAt: '2024-01-14',
        active: false,
      },
      {
        id: '5',
        title: 'Gift Finder',
        icon: '🎁',
        description: 'Curated gift suggestions for any occasion',
        categories: ['Fashion', 'Home & Garden', 'Beauty & Personal Care'],
        products: ['1', '2', '4', '5'],
        color: 'from-green-500 to-emerald-600',
        autoBundles: 6,
        suggestedProducts: 20,
        createdAt: '2024-01-15',
        active: true,
      },
      {
        id: '6',
        title: 'Fitness Starter',
        icon: '💪',
        description: 'Beginner fitness equipment and gear',
        categories: ['Sports & Outdoors', 'Home & Garden'],
        products: ['5', '6'],
        color: 'from-red-500 to-orange-600',
        autoBundles: 3,
        suggestedProducts: 9,
        createdAt: '2024-01-16',
        active: true,
      },
    ];
    
    return ok({ data: mockIntents });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const body = await req.json();
    
    // TODO: Implement intent creation in database
    return created({ id: Date.now().toString(), ...body });
  } catch (err) {
    return handleApiError(err);
  }
}
