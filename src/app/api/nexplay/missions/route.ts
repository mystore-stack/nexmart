// src/app/api/nexplay/missions/route.ts
// GET /api/nexplay/missions - List available missions
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);

    // Get active missions
    const missions = await prisma.nexPlayMission.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      missions: missions.map((mission) => ({
        id: mission.id,
        type: mission.type,
        label: mission.label,
        reward: mission.reward,
        goal: mission.goal,
      })),
    });
  } catch (error: any) {
    console.error('[NEXPLAY MISSIONS]', error);
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch missions' },
      { status: 500 }
    );
  }
}
