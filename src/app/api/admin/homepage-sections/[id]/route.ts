import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    
    const section = await prisma.homePageSection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    
    const section = await prisma.homePageSection.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    
    await prisma.homePageSection.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}