import { prisma } from '@/lib/prisma';

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  itemType: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    stock: number;
  } | null;
  variant: {
    id: string;
    name: string;
    value: string;
    label: string;
    price: number | null;
    stock: number;
  } | null;
}

export class CartService {
  /**
   * Get cart items for user
   */
  static async getUserCart(userId: string): Promise<CartItemWithProduct[]> {
    return prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true,
            stock: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            value: true,
            label: true,
            price: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get cart count for user
   */
  static async getCartCount(userId: string): Promise<number> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      select: { quantity: true },
    });

    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get cart total for user
   */
  static async getCartTotal(userId: string): Promise<number> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      select: { subtotal: true },
    });

    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId: string, data: {
    productId?: string;
    variantId?: string;
    quantity: number;
  }) {
    const { productId, variantId, quantity } = data;

    // Get product price
    let unitPrice = 0;
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true },
      });
      unitPrice = product?.price || 0;
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { price: true },
      });
      unitPrice = variant?.price || unitPrice;
    }

    const subtotal = unitPrice * quantity;

    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId: productId || null,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      // Update quantity
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          subtotal: existingItem.subtotal + subtotal,
          unitPrice,
        },
      });
    }

    // Create new cart item
    return prisma.cartItem.create({
      data: {
        userId,
        productId,
        variantId,
        quantity,
        unitPrice,
        subtotal,
        itemType: productId ? 'PRODUCT' : 'VARIANT',
      },
    });
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(cartItemId: string) {
    return prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItemQuantity(cartItemId: string, quantity: number) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      select: { unitPrice: true },
    });

    if (!cartItem) throw new Error('Cart item not found');

    const subtotal = cartItem.unitPrice * quantity;

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity, subtotal },
    });
  }

  /**
   * Clear cart
   */
  static async clearCart(userId: string) {
    return prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
