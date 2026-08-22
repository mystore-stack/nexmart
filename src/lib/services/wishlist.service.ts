import { prisma } from '@/lib/prisma';

export interface WishlistItemWithProduct {
  id: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    comparePrice: number | null;
    stock: number;
  };
}

export class WishlistService {
  /**
   * Get user wishlist
   */
  static async getUserWishlist(userId: string): Promise<WishlistItemWithProduct[]> {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true,
            comparePrice: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get wishlist count
   */
  static async getWishlistCount(userId: string): Promise<number> {
    return prisma.wishlistItem.count({
      where: { userId },
    });
  }

  /**
   * Check if product is in wishlist
   */
  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!item;
  }

  /**
   * Add to wishlist
   */
  static async addToWishlist(userId: string, productId: string) {
    return prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
    });
  }

  /**
   * Remove from wishlist
   */
  static async removeFromWishlist(userId: string, productId: string) {
    return prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  /**
   * Toggle wishlist item
   */
  static async toggleWishlist(userId: string, productId: string) {
    const isInWishlist = await this.isInWishlist(userId, productId);

    if (isInWishlist) {
      await this.removeFromWishlist(userId, productId);
      return false;
    } else {
      await this.addToWishlist(userId, productId);
      return true;
    }
  }
}
