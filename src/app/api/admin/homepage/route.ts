import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CMSContentStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-api';
import { getDefaultOrganizationId } from '@/lib/tenant';

// Map frontend section types to Prisma enum values
function mapSectionType(frontendType: string): string {
  const sectionTypeMap: Record<string, string> = {
    'hero-banner': 'HERO',
    'features': 'BENEFITS',
    'featured-products': 'FEATURED_PRODUCTS',
    'categories': 'CATEGORIES',
    'flash-sale': 'FLASH_DEALS',
    'brand': 'BRAND_LOGOS',
    'newsletter': 'NEWSLETTER',
    'banner': 'PROMOTIONAL_BANNER',
    'cta': 'CTA_BANNER',
    'testimonials': 'TESTIMONIALS',
    'gallery': 'IMAGE_GALLERY',
    'product-carousel': 'PRODUCT_CAROUSEL',
    'product-grid': 'PRODUCT_GRID',
    'sponsored-products': 'SPONSORED_PRODUCTS',
    'flash-deals': 'FLASH_DEALS',
    'frequently-bought-together': 'FREQUENTLY_BOUGHT_TOGETHER',
    'buy-more-save-more': 'BUY_MORE_SAVE_MORE',
    'mystery-boxes': 'MYSTERY_BOXES',
    'build-your-own-bundle': 'BUILD_YOUR_OWN_BUNDLE',
  };
  
  return sectionTypeMap[frontendType] || frontendType.toUpperCase().replace(/-/g, '_');
}

// GET - Fetch homepage by pageType
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType');

    if (!pageType) {
      return NextResponse.json(
        { success: false, error: 'pageType is required' },
        { status: 400 }
      );
    }

    const page = await prisma.pageBuilderPage.findFirst({
      where: {
        pageType: pageType as any,
        organizationId,
      },
      include: {
        sections: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Homepage not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('[HOMEPAGE_API] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch homepage' },
      { status: 500 }
    );
  }
}

// POST - Create new homepage
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const body = await request.json();
    const { pageType, name, slug, sections, theme, status, publishDate } = body;

    if (!pageType || !name || !slug) {
      return NextResponse.json(
        { success: false, error: 'pageType, name, and slug are required' },
        { status: 400 }
      );
    }

    // Check if homepage already exists
    const existing = await prisma.pageBuilderPage.findFirst({
      where: {
        pageType: pageType as any,
        organizationId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Homepage already exists' },
        { status: 409 }
      );
    }

    // Create homepage with sections
    const page = await prisma.pageBuilderPage.create({
      data: {
        organizationId,
        pageType: pageType as any,
        name,
        slug,
        status: status || CMSContentStatus.DRAFT,
        publishDate: publishDate ? new Date(publishDate) : null,
        accentColor: theme?.colors?.primary,
        sectionBackground: theme?.colors?.background,
        buttonStyle: 'default',
        cardStyle: 'default',
        borderRadius: theme?.borderRadius?.md,
        shadow: theme?.shadows?.md,
        gradient: theme?.colors?.secondary,
        sections: {
          create: sections.map((section: any, index: number) => ({
            sectionType: mapSectionType(section.type) as any,
            displayOrder: index,
            enabled: section.enabled ?? true,
            config: {
              name: section.name,
              content: section.content,
              design: section.design,
              layout: section.layout,
              animation: section.animation,
              responsive: section.responsive,
              seo: section.seo,
            },
          })),
        },
      },
      include: {
        sections: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('[HOMEPAGE_API] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create homepage' },
      { status: 500 }
    );
  }
}

// PUT - Update existing homepage
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const body = await request.json();
    const { id, pageType, name, slug, sections, theme, status, publishDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.pageBuilderPage.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Homepage not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete existing sections
    await prisma.pageSection.deleteMany({
      where: {
        pageId: id,
      },
    });

    // Update homepage with new sections
    const page = await prisma.pageBuilderPage.update({
      where: {
        id,
      },
      data: {
        pageType: pageType as any,
        name,
        slug,
        status: status || CMSContentStatus.DRAFT,
        publishDate: publishDate ? new Date(publishDate) : null,
        accentColor: theme?.colors?.primary,
        sectionBackground: theme?.colors?.background,
        buttonStyle: 'default',
        cardStyle: 'default',
        borderRadius: theme?.borderRadius?.md,
        shadow: theme?.shadows?.md,
        gradient: theme?.colors?.secondary,
        sections: {
          create: sections.map((section: any, index: number) => ({
            sectionType: mapSectionType(section.type) as any,
            displayOrder: index,
            enabled: section.enabled ?? true,
            config: {
              name: section.name,
              content: section.content,
              design: section.design,
              layout: section.layout,
              animation: section.animation,
              responsive: section.responsive,
              seo: section.seo,
            },
          })),
        },
      },
      include: {
        sections: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('[HOMEPAGE_API] PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update homepage' },
      { status: 500 }
    );
  }
}
