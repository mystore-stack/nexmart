import { prisma } from '@/lib/prisma';

export interface HeroBannerData {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  badgeText: string | null;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  primaryButtonText: string | null;
  primaryButtonLink: string | null;
  primaryButtonColor: string | null;
  secondaryButtonText: string | null;
  secondaryButtonLink: string | null;
  secondaryButtonColor: string | null;
  heroHeight: string;
  heroPosition: string;
  overlayOpacity: number;
  backgroundImageOverlayColor: string | null;
  videoUrl: string | null;
  isActive: boolean;
  isPublished: boolean;
  displayOrder: number;
  publishDate: Date | null;
  expireDate: Date | null;
}

export class HeroService {
  /**
   * Get active hero banner
   */
  static async getActiveHeroBanner(): Promise<HeroBannerData | null> {
    const now = new Date();
    
    return prisma.heroBanner.findFirst({
      where: {
        isActive: true,
        isPublished: true,
        OR: [
          { publishDate: null },
          { publishDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { expireDate: null },
              { expireDate: { gt: now } },
            ],
          },
        ],
      },
      orderBy: [
        { displayOrder: 'asc' },
        { priorityScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get all hero banners (for admin)
   */
  static async getAllHeroBanners() {
    return prisma.heroBanner.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get hero banner by ID
   */
  static async getHeroBannerById(id: string) {
    return prisma.heroBanner.findUnique({
      where: { id },
    });
  }
}
