// src/app/api/products/brands/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    // Get all unique brands from product tags
    const products = await prisma.product.findMany({
      where: {
        published: true,
      },
      select: {
        tags: true,
      },
    });

    // Extract unique brands from tags
    const brandsSet = new Set<string>();
    products.forEach((product) => {
      product.tags.forEach((tag) => {
        // Assume brand tags are typically capitalized or follow certain patterns
        // You can customize this logic based on your tagging convention
        if (tag.length > 2 && tag === tag.toUpperCase()) {
          brandsSet.add(tag);
        }
      });
    });

    const brands = Array.from(brandsSet).sort();

    return ok({ brands });
  } catch (err) {
    return handleApiError(err);
  }
}
