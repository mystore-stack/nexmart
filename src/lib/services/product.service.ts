import { prisma } from '@/lib/prisma';

export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  featured: boolean;
  isVisible: boolean;
  displayOrder: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export class ProductService {
  /**
   * Get published products with category
   * Optimized query to avoid N+1
   */
  static async getPublishedProducts(options: {
    limit?: number;
    skip?: number;
    featured?: boolean;
    categoryId?: string;
    searchQuery?: string;
  } = {}): Promise<ProductWithCategory[]> {
    const { limit = 10, skip = 0, featured, categoryId, searchQuery } = options;

    const where: any = {
      published: true,
      isVisible: true,
    };

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip,
    });
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            value: true,
            label: true,
            price: true,
            stock: true,
            sku: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            body: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit = 8) {
    return this.getPublishedProducts({ featured: true, limit });
  }

  /**
   * Search products
   */
  static async searchProducts(query: string, limit = 20) {
    return this.getPublishedProducts({ searchQuery: query, limit });
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(categorySlug: string, limit = 20) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    if (!category) return [];

    return this.getPublishedProducts({ categoryId: category.id, limit });
  }

  /**
   * Get product count
   */
  static async getProductCount(options: {
    featured?: boolean;
    categoryId?: string;
    searchQuery?: string;
  } = {}): Promise<number> {
    const { featured, categoryId, searchQuery } = options;

    const where: any = {
      published: true,
      isVisible: true,
    };

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    return prisma.product.count({ where });
  }
}
