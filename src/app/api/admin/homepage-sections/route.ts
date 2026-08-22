import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const sections = await prisma.homePageSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    
    const section = await prisma.homePageSection.create({
      data: body
    });

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}