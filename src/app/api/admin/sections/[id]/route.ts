import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/lib/next-auth.config';

async function checkAdminAuth() {
  const session = await auth();
  
  if (!session?.user) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return false;
  }

  return true;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sectionType, displayOrder, isPublished, isVisible } = body;

    if (!sectionType) {
      return NextResponse.json(
        { error: 'Section type is required' },
        { status: 400 }
      );
    }

    let updatedSection;

    // Map section types to Prisma models
    const sectionModelMap: Record<string, any> = {
      'homepage-section': prisma.homepageSection,
      'announcement-bar': prisma.announcementBar,
      'hero-banner': prisma.heroBanner,
      'footer-config': prisma.footerConfig,
      'testimonial': prisma.testimonial,
      'page-section': prisma.pageSection,
      'featured-category': prisma.featuredCategory,
      'sponsored-product': prisma.sponsoredProduct,
      'flash-deal': prisma.flashDeal,
      'brand': prisma.brand,
      'super-deal': prisma.superDeal,
      'frequently-bought-together': prisma.frequentlyBoughtTogether,
      'buy-more-save-more': prisma.buyMoreSaveMore,
      'mystery-box': prisma.mysteryBox,
      'build-your-own-bundle': prisma.buildYourOwnBundle,
      'navigation-menu-item': prisma.navigationMenuItem,
    };

    const model = sectionModelMap[sectionType];

    if (!model) {
      return NextResponse.json(
        { error: 'Invalid section type' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (typeof displayOrder === 'number') {
      updateData.displayOrder = displayOrder;
    }
    if (typeof isPublished === 'boolean') {
      updateData.isPublished = isPublished;
    }
    if (typeof isVisible === 'boolean') {
      updateData.isVisible = isVisible;
    }

    // Update the section
    updatedSection = await model.update({
      where: { id },
      data: updateData,
    });

    // Revalidate paths and tags
    revalidatePath('/');
    revalidatePath('/admin/homepage-builder');
    revalidatePath('/admin/page-builder');
    revalidateTag('homepage');
    revalidateTag('sections');
    revalidateTag(sectionType);

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sectionType, sections } = body;

    if (!sectionType || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Section type and sections array are required' },
        { status: 400 }
      );
    }

    // Map section types to Prisma models
    const sectionModelMap: Record<string, any> = {
      'homepage-section': prisma.homepageSection,
      'announcement-bar': prisma.announcementBar,
      'hero-banner': prisma.heroBanner,
      'footer-config': prisma.footerConfig,
      'testimonial': prisma.testimonial,
      'page-section': prisma.pageSection,
      'featured-category': prisma.featuredCategory,
      'sponsored-product': prisma.sponsoredProduct,
      'flash-deal': prisma.flashDeal,
      'brand': prisma.brand,
      'super-deal': prisma.superDeal,
      'frequently-bought-together': prisma.frequentlyBoughtTogether,
      'buy-more-save-more': prisma.buyMoreSaveMore,
      'mystery-box': prisma.mysteryBox,
      'build-your-own-bundle': prisma.buildYourOwnBundle,
      'navigation-menu-item': prisma.navigationMenuItem,
    };

    const model = sectionModelMap[sectionType];

    if (!model) {
      return NextResponse.json(
        { error: 'Invalid section type' },
        { status: 400 }
      );
    }

    // Bulk update display order
    const updatePromises = sections.map((section: any) =>
      model.update({
        where: { id: section.id },
        data: { displayOrder: section.displayOrder },
      })
    );

    await Promise.all(updatePromises);

    // Revalidate paths and tags
    revalidatePath('/');
    revalidatePath('/admin/homepage-builder');
    revalidatePath('/admin/page-builder');
    revalidateTag('homepage');
    revalidateTag('sections');
    revalidateTag(sectionType);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating sections order:', error);
    return NextResponse.json(
      { error: 'Failed to update sections order' },
      { status: 500 }
    );
  }
}
