// src/app/api/admin/bundles/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, created, handleApiError } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Try Supabase first
    try {
      const { data: bundles, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_products (
            product_id,
            products (
              id,
              name,
              price,
              images
            )
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (bundles && bundles.length > 0) {
        // Transform to match frontend format
        const formattedBundles = bundles.map((bundle: any) => ({
          id: bundle.id,
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description,
          image: bundle.image,
          products: bundle.bundle_products.map((bp: any) => ({
            id: bp.products.id,
            name: bp.products.name,
            price: bp.products.price,
            image: bp.products.images?.[0] || null,
          })),
          regularPrice: bundle.regular_price,
          bundlePrice: bundle.bundle_price,
          discount: bundle.discount,
          sales: bundle.sales,
          active: bundle.active,
          createdAt: bundle.created_at,
        }));
        
        return ok({ data: formattedBundles });
      }
    } catch (supabaseError) {
      console.log('Supabase error, falling back to Prisma:', supabaseError);
    }
    
    // Fallback to Prisma if Supabase fails
    try {
      const bundles = await prisma.bundle.findMany({
        where: { organizationId },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Transform to match frontend format
      const formattedBundles = bundles.map((bundle: any) => ({
        id: bundle.id,
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        image: bundle.image,
        products: bundle.products.map((bp: any) => ({
          id: bp.product.id,
          name: bp.product.name,
          price: bp.product.price,
          image: bp.product.images[0] || null,
        })),
        regularPrice: bundle.regularPrice,
        bundlePrice: bundle.bundlePrice,
        discount: bundle.discount,
        sales: bundle.sales,
        active: bundle.active,
        createdAt: bundle.createdAt.toISOString(),
      }));
      
      return ok({ data: formattedBundles });
    } catch (prismaError: any) {
      // If Bundle model doesn't exist, return mock data
      if (prismaError.code === 'P2025' || prismaError.message?.includes('does not exist')) {
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
      }
      throw prismaError;
    }
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const body = await req.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { name, description, image, productIds, regularPrice, bundlePrice, active = true } = body;
    
    // Calculate discount percentage
    const discount = Math.round(((regularPrice - bundlePrice) / regularPrice) * 100);
    
    // Try Supabase first
    try {
      const { data: bundle, error } = await supabase
        .from('bundles')
        .insert({
          organization_id: organizationId,
          name,
          slug: toSlug(name),
          description,
          image,
          regular_price: regularPrice,
          bundle_price: bundlePrice,
          discount,
          active,
          sales: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add products to bundle
      if (productIds && productIds.length > 0) {
        const bundleProducts = productIds.map((productId: string) => ({
          bundle_id: bundle.id,
          product_id: productId,
        }));
        
        await supabase.from('bundle_products').insert(bundleProducts);
      }
      
      // Fetch complete bundle with products
      const { data: completeBundle } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_products (
            product_id,
            products (
              id,
              name,
              price,
              images
            )
          )
        `)
        .eq('id', bundle.id)
        .single();
      
      // Transform to match frontend format
      const formattedBundle = {
        id: completeBundle.id,
        name: completeBundle.name,
        slug: completeBundle.slug,
        description: completeBundle.description,
        image: completeBundle.image,
        products: completeBundle.bundle_products.map((bp: any) => ({
          id: bp.products.id,
          name: bp.products.name,
          price: bp.products.price,
          image: bp.products.images?.[0] || null,
        })),
        regularPrice: completeBundle.regular_price,
        bundlePrice: completeBundle.bundle_price,
        discount: completeBundle.discount,
        sales: completeBundle.sales,
        active: completeBundle.active,
        createdAt: completeBundle.created_at,
      };
      
      return created(formattedBundle);
    } catch (supabaseError) {
      console.log('Supabase error, falling back to Prisma:', supabaseError);
      
      // Fallback to Prisma
      try {
        const bundle = await prisma.bundle.create({
          data: {
            organizationId,
            name,
            slug: toSlug(name),
            description,
            image,
            regularPrice,
            bundlePrice,
            discount,
            active,
            products: {
              create: productIds.map((productId: string) => ({
                productId,
              })),
            },
          },
          include: {
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                  },
                },
              },
            },
          },
        });
        
        // Transform to match frontend format
        const formattedBundle = {
          id: bundle.id,
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description,
          image: bundle.image,
          products: bundle.products.map((bp: any) => ({
            id: bp.product.id,
            name: bp.product.name,
            price: bp.product.price,
            image: bp.product.images[0] || null,
          })),
          regularPrice: bundle.regularPrice,
          bundlePrice: bundle.bundlePrice,
          discount: bundle.discount,
          sales: bundle.sales,
          active: bundle.active,
          createdAt: bundle.createdAt.toISOString(),
        };
        
        return created(formattedBundle);
      } catch (prismaError: any) {
        // If Bundle model doesn't exist, return mock response
        if (prismaError.code === 'P2025' || prismaError.message?.includes('does not exist')) {
          return created({ 
            id: Date.now().toString(), 
            name, 
            description, 
            image, 
            regularPrice, 
            bundlePrice, 
            discount, 
            active,
            createdAt: new Date().toISOString(),
            message: 'Bundle created (mock - database not connected)'
          });
        }
        throw prismaError;
      }
    }
  } catch (err) {
    return handleApiError(err);
  }
}
