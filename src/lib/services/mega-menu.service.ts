import { prisma } from '@/lib/prisma';
import { getDefaultOrganizationId } from '@/lib/tenant';

interface MenuItem {
  id: string;
  label: string;
  link?: string;
  icon?: string;
  image?: string;
  description?: string;
  displayOrder: number;
  isEnabled: boolean;
  isFeatured: boolean;
  config?: any;
  children?: MenuItem[];
  featuredProducts?: any[];
}

interface MegaMenuConfig {
  name: string;
  isEnabled: boolean;
  displayOrder: number;
  config?: any;
}

export class MegaMenuService {
  /**
   * Get active mega menu for organization
   */
  static async getActiveMegaMenu(): Promise<{
    menu: any;
    items: MenuItem[];
  } | null> {
    const organizationId = await getDefaultOrganizationId();

    const menu = await prisma.megaMenu.findFirst({
      where: {
        organizationId,
        isEnabled: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    if (!menu) return null;

    const items = await this.getMenuItems(menu.id);

    return { menu, items };
  }

  /**
   * Get menu items for a mega menu
   */
  static async getMenuItems(megaMenuId: string): Promise<MenuItem[]> {
    const items = await prisma.megaMenuItem.findMany({
      where: {
        megaMenuId,
        isEnabled: true,
        parentId: null, // Only top-level items
      },
      include: {
        children: {
          where: { isEnabled: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            featuredProducts: {
              include: {
                product: {
                  include: { category: true },
                },
              },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        featuredProducts: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return items.map(item => this.formatMenuItem(item));
  }

  /**
   * Format menu item for API response
   */
  private static formatMenuItem(item: any): MenuItem {
    return {
      id: item.id,
      label: item.label,
      link: item.link,
      icon: item.icon,
      image: item.image,
      description: item.description,
      displayOrder: item.displayOrder,
      isEnabled: item.isEnabled,
      isFeatured: item.isFeatured,
      config: item.config,
      children: item.children?.map((child: any) => this.formatMenuItem(child)),
      featuredProducts: item.featuredProducts?.map((fp: any) => ({
        ...fp.product,
        displayOrder: fp.displayOrder,
      })),
    };
  }

  /**
   * Create mega menu
   */
  static async createMegaMenu(config: MegaMenuConfig): Promise<any> {
    const organizationId = await getDefaultOrganizationId();

    return prisma.megaMenu.create({
      data: {
        organizationId,
        name: config.name,
        isEnabled: config.isEnabled,
        displayOrder: config.displayOrder,
        config: config.config || {},
      },
    });
  }

  /**
   * Update mega menu
   */
  static async updateMegaMenu(id: string, config: Partial<MegaMenuConfig>): Promise<any> {
    return prisma.megaMenu.update({
      where: { id },
      data: {
        ...config,
        config: config.config || undefined,
      },
    });
  }

  /**
   * Delete mega menu
   */
  static async deleteMegaMenu(id: string): Promise<void> {
    await prisma.megaMenu.delete({
      where: { id },
    });
  }

  /**
   * Create menu item
   */
  static async createMenuItem(
    megaMenuId: string,
    item: Omit<MenuItem, 'id' | 'children' | 'featuredProducts'>,
    parentId?: string
  ): Promise<any> {
    return prisma.megaMenuItem.create({
      data: {
        megaMenuId,
        parentId,
        label: item.label,
        link: item.link,
        icon: item.icon,
        image: item.image,
        description: item.description,
        displayOrder: item.displayOrder,
        isEnabled: item.isEnabled,
        isFeatured: item.isFeatured,
        config: item.config || {},
      },
    });
  }

  /**
   * Update menu item
   */
  static async updateMenuItem(
    id: string,
    item: Partial<MenuItem>
  ): Promise<any> {
    return prisma.megaMenuItem.update({
      where: { id },
      data: {
        label: item.label,
        link: item.link,
        icon: item.icon,
        image: item.image,
        description: item.description,
        displayOrder: item.displayOrder,
        isEnabled: item.isEnabled,
        isFeatured: item.isFeatured,
        config: item.config || undefined,
      },
    });
  }

  /**
   * Delete menu item
   */
  static async deleteMenuItem(id: string): Promise<void> {
    await prisma.megaMenuItem.delete({
      where: { id },
    });
  }

  /**
   * Add featured product to menu item
   */
  static async addFeaturedProduct(
    menuItemId: string,
    productId: string,
    displayOrder: number = 0
  ): Promise<any> {
    return prisma.megaMenuFeaturedProduct.create({
      data: {
        menuItemId,
        productId,
        displayOrder,
      },
    });
  }

  /**
   * Remove featured product from menu item
   */
  static async removeFeaturedProduct(menuItemId: string, productId: string): Promise<void> {
    await prisma.megaMenuFeaturedProduct.deleteMany({
      where: {
        menuItemId,
        productId,
      },
    });
  }

  /**
   * Reorder menu items
   */
  static async reorderMenuItems(
    megaMenuId: string,
    itemOrders: Array<{ id: string; displayOrder: number }>
  ): Promise<void> {
    for (const { id, displayOrder } of itemOrders) {
      await prisma.megaMenuItem.update({
        where: { id },
        data: { displayOrder },
      });
    }
  }

  /**
   * Initialize default mega menu
   */
  static async initializeDefaultMegaMenu(): Promise<any> {
    const organizationId = await getDefaultOrganizationId();

    // Check if default menu exists
    const existing = await prisma.megaMenu.findFirst({
      where: {
        organizationId,
        name: 'Default Mega Menu',
      },
    });

    if (existing) return existing;

    // Create default mega menu
    const menu = await this.createMegaMenu({
      name: 'Default Mega Menu',
      isEnabled: true,
      displayOrder: 0,
      config: {
        style: 'horizontal',
        dropdownAnimation: 'fade',
        mobileStyle: 'accordion',
      },
    });

    // Create default menu items
    const categoriesItem = await this.createMenuItem(menu.id, {
      label: 'Catégories',
      link: '/categories',
      displayOrder: 0,
      isEnabled: true,
      isFeatured: false,
    });

    const featuredItem = await this.createMenuItem(menu.id, {
      label: 'Vedettes',
      link: '/featured',
      displayOrder: 1,
      isEnabled: true,
      isFeatured: true,
      description: 'Nos produits les plus populaires',
    });

    const dealsItem = await this.createMenuItem(menu.id, {
      label: 'Offres',
      link: '/deals',
      displayOrder: 2,
      isEnabled: true,
      isFeatured: true,
      description: 'Prix réduits pour temps limité',
    });

    const newArrivalsItem = await this.createMenuItem(menu.id, {
      label: 'Nouveautés',
      link: '/new',
      displayOrder: 3,
      isEnabled: true,
      isFeatured: false,
    });

    const brandsItem = await this.createMenuItem(menu.id, {
      label: 'Marques',
      link: '/brands',
      displayOrder: 4,
      isEnabled: true,
      isFeatured: false,
    });

    // Create sub-items for categories
    const electronicsItem = await this.createMenuItem(menu.id, {
      label: 'Électronique',
      link: '/category/electronics',
      displayOrder: 0,
      isEnabled: true,
      isFeatured: false,
    }, categoriesItem.id);

    const fashionItem = await this.createMenuItem(menu.id, {
      label: 'Mode',
      link: '/category/fashion',
      displayOrder: 1,
      isEnabled: true,
      isFeatured: false,
    }, categoriesItem.id);

    const homeItem = await this.createMenuItem(menu.id, {
      label: 'Maison',
      link: '/category/home',
      displayOrder: 2,
      isEnabled: true,
      isFeatured: false,
    }, categoriesItem.id);

    const beautyItem = await this.createMenuItem(menu.id, {
      label: 'Beauté',
      link: '/category/beauty',
      displayOrder: 3,
      isEnabled: true,
      isFeatured: false,
    }, categoriesItem.id);

    return menu;
  }

  /**
   * Get mega menu by ID
   */
  static async getMegaMenuById(id: string): Promise<{
    menu: any;
    items: MenuItem[];
  } | null> {
    const menu = await prisma.megaMenu.findUnique({
      where: { id },
    });

    if (!menu) return null;

    const items = await this.getMenuItems(id);

    return { menu, items };
  }

  /**
   * Get all mega menus for organization
   */
  static async getAllMegaMenus(): Promise<any[]> {
    const organizationId = await getDefaultOrganizationId();

    return prisma.megaMenu.findMany({
      where: { organizationId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Toggle mega menu active state
   */
  static async toggleMegaMenu(id: string): Promise<any> {
    const menu = await prisma.megaMenu.findUnique({
      where: { id },
    });

    if (!menu) throw new Error('Menu not found');

    return prisma.megaMenu.update({
      where: { id },
      data: { isEnabled: !menu.isEnabled },
    });
  }

  /**
   * Duplicate mega menu
   */
  static async duplicateMegaMenu(id: string): Promise<any> {
    const original = await this.getMegaMenuById(id);
    if (!original) throw new Error('Menu not found');

    const newMenu = await this.createMegaMenu({
      name: `${original.menu.name} (Copy)`,
      isEnabled: false,
      displayOrder: original.menu.displayOrder + 1,
      config: original.menu.config,
    });

    // Copy all items recursively
    const copyItems = async (parentId: string | null, originalParentId: string | null) => {
      const originalItems = original.items.filter(
        item => (parentId ? item.children?.includes(item) : !parentId) === true
      );

      for (const originalItem of originalItems) {
        const newItem = await this.createMenuItem(newMenu.id, {
          label: originalItem.label,
          link: originalItem.link,
          icon: originalItem.icon,
          image: originalItem.image,
          description: originalItem.description,
          displayOrder: originalItem.displayOrder,
          isEnabled: originalItem.isEnabled,
          isFeatured: originalItem.isFeatured,
          config: originalItem.config,
        }, parentId);

        // Copy featured products
        if (originalItem.featuredProducts) {
          for (const fp of originalItem.featuredProducts) {
            await this.addFeaturedProduct(newItem.id, fp.id, fp.displayOrder);
          }
        }

        // Recursively copy children
        if (originalItem.children && originalItem.children.length > 0) {
          await copyItems(newItem.id, originalItem.id);
        }
      }
    };

    await copyItems(null, null);

    return newMenu;
  }

  /**
   * Get menu item by ID
   */
  static async getMenuItemById(id: string): Promise<MenuItem | null> {
    const item = await prisma.megaMenuItem.findUnique({
      where: { id },
      include: {
        children: {
          where: { isEnabled: true },
          orderBy: { displayOrder: 'asc' },
        },
        featuredProducts: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!item) return null;

    return this.formatMenuItem(item);
  }

  /**
   * Search menu items
   */
  static async searchMenuItems(query: string): Promise<MenuItem[]> {
    const organizationId = await getDefaultOrganizationId();

    const menus = await prisma.megaMenu.findMany({
      where: { organizationId, isEnabled: true },
      select: { id: true },
    });

    const menuIds = menus.map(m => m.id);

    const items = await prisma.megaMenuItem.findMany({
      where: {
        megaMenuId: { in: menuIds },
        isEnabled: true,
        OR: [
          { label: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        children: {
          where: { isEnabled: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return items.map(item => this.formatMenuItem(item));
  }

  /**
   * Get menu breadcrumbs
   */
  static async getBreadcrumbs(menuItemId: string): Promise<MenuItem[]> {
    const breadcrumbs: MenuItem[] = [];
    let currentItem = await this.getMenuItemById(menuItemId);

    while (currentItem) {
      breadcrumbs.unshift(currentItem);

      if (!currentItem.children || currentItem.children.length === 0) {
        // Get parent
        const parent = await prisma.megaMenuItem.findFirst({
          where: {
            children: {
              some: { id: currentItem.id },
            },
          },
        });

        if (parent) {
          currentItem = await this.getMenuItemById(parent.id);
        } else {
          currentItem = null;
        }
      } else {
        currentItem = null;
      }
    }

    return breadcrumbs;
  }
}
