import { prisma } from '@/lib/prisma';

export interface CategoryWithProductCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  _count: {
    products: number;
  };
}

export class CategoryService {
  /**
   * Get all categories with product count
   */
  static async getCategoriesWithProductCount(): Promise<CategoryWithProductCount[]> {
    return prisma.category.findMany({
      where: {
        parentId: null, // Only top-level categories
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                published: true,
                isVisible: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Get all categories (for navigation)
   */
  static async getAllCategories() {
    return prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
