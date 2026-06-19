// src/lib/automation/customer-segmentation.ts — Customer Segmentation Automation
import { prisma } from '@/lib/prisma';

// Segment rule types
export type SegmentRule = {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
  value: any;
};

// Create a new marketing segment
export async function createMarketingSegment(
  organizationId: string,
  name: string,
  description: string | null,
  rules: SegmentRule[]
) {
  try {
    const segment = await prisma.marketingSegment.create({
      data: {
        organizationId,
        name,
        description,
        rules: rules as any,
        userCount: 0,
        isActive: true,
      },
    });

    // Calculate initial user count
    await updateSegmentUserCount(segment.id);

    return segment;
  } catch (error) {
    console.error('[Create Marketing Segment Error]:', error);
    throw error;
  }
}

// Update segment user count based on rules
async function updateSegmentUserCount(segmentId: string) {
  try {
    const segment = await prisma.marketingSegment.findUnique({
      where: { id: segmentId },
      select: { rules: true, organizationId: true },
    });

    if (!segment) return;

    const users = await findUsersMatchingRules(segment.organizationId, segment.rules as SegmentRule[]);
    
    await prisma.marketingSegment.update({
      where: { id: segmentId },
      data: { userCount: users.length },
    });

    return users.length;
  } catch (error) {
    console.error('[Update Segment User Count Error]:', error);
  }
}

// Find users matching segment rules
async function findUsersMatchingRules(organizationId: string, rules: SegmentRule[]) {
  try {
    // Build Prisma query based on rules
    const where: any = { organizationId };

    for (const rule of rules) {
      switch (rule.field) {
        case 'totalOrders':
          where.orders = { some: {} };
          if (rule.operator === 'gte') {
            where.orders = { some: { total: { gte: rule.value } } };
          }
          break;
        case 'totalSpent':
          where.orders = { some: { total: { [rule.operator]: rule.value } } };
          break;
        case 'lastOrderDays':
          const date = new Date();
          date.setDate(date.getDate() - rule.value);
          where.orders = { some: { createdAt: { gte: date } } };
          break;
        case 'hasPurchased':
          where.orders = rule.value ? { some: {} } : { none: {} };
          break;
        case 'registrationDays':
          const regDate = new Date();
          regDate.setDate(regDate.getDate() - rule.value);
          where.createdAt = { [rule.operator]: regDate };
          break;
        case 'role':
          where.role = { [rule.operator]: rule.value };
          break;
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    return users;
  } catch (error) {
    console.error('[Find Users Matching Rules Error]:', error);
    return [];
  }
}

// Assign users to segment
export async function assignUsersToSegment(segmentId: string) {
  try {
    const segment = await prisma.marketingSegment.findUnique({
      where: { id: segmentId },
      select: { rules: true, organizationId: true },
    });

    if (!segment) return;

    const users = await findUsersMatchingRules(segment.organizationId, segment.rules as SegmentRule[]);

    // Clear existing members
    await prisma.marketingSegmentMember.deleteMany({
      where: { segmentId },
    });

    // Assign new members
    const members = await prisma.marketingSegmentMember.createMany({
      data: users.map((user) => ({
        segmentId,
        userId: user.id,
        organizationId: segment.organizationId,
        score: 1.0,
      })),
      skipDuplicates: true,
    });

    // Update segment user count
    await prisma.marketingSegment.update({
      where: { id: segmentId },
      data: { userCount: members.count },
    });

    console.log(`[Customer Segmentation] Assigned ${members.count} users to segment ${segmentId}`);
    return members;
  } catch (error) {
    console.error('[Assign Users To Segment Error]:', error);
    throw error;
  }
}

// Get predefined segment templates
export function getSegmentTemplates() {
  return [
    {
      name: 'Nouveaux clients (7 jours)',
      description: 'Clients inscrits depuis moins de 7 jours',
      rules: [
        { field: 'registrationDays', operator: 'lte', value: 7 },
      ],
    },
    {
      name: 'Clients VIP',
      description: 'Clients ayant dépensé plus de 5000 DH',
      rules: [
        { field: 'totalSpent', operator: 'gte', value: 5000 },
      ],
    },
    {
      name: 'Clients inactifs (30 jours)',
      description: 'Clients sans commande depuis 30 jours',
      rules: [
        { field: 'hasPurchased', operator: 'eq', value: true },
        { field: 'lastOrderDays', operator: 'gte', value: 30 },
      ],
    },
    {
      name: 'Clients fidèles',
      description: 'Clients avec plus de 5 commandes',
      rules: [
        { field: 'totalOrders', operator: 'gte', value: 5 },
      ],
    },
    {
      name: 'Paniers moyens',
      description: 'Clients avec panier moyen entre 200-500 DH',
      rules: [
        { field: 'totalSpent', operator: 'gte', value: 200 },
        { field: 'totalSpent', operator: 'lte', value: 500 },
      ],
    },
  ];
}

// Create predefined segments for an organization
export async function createPredefinedSegments(organizationId: string) {
  try {
    const templates = getSegmentTemplates();
    const segments = [];

    for (const template of templates) {
      const segment = await createMarketingSegment(
        organizationId,
        template.name,
        template.description,
        template.rules
      );
      segments.push(segment);
    }

    console.log(`[Customer Segmentation] Created ${segments.length} predefined segments for organization ${organizationId}`);
    return segments;
  } catch (error) {
    console.error('[Create Predefined Segments Error]:', error);
    throw error;
  }
}

// Get segment statistics
export async function getSegmentStatistics(segmentId: string) {
  try {
    const segment = await prisma.marketingSegment.findUnique({
      where: { id: segmentId },
      include: {
        segmentMembers: {
          include: {
            user: {
              select: {
                orders: {
                  select: { total: true, createdAt: true },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!segment) return null;

    const totalMembers = segment.segmentMembers.length;
    const totalSpent = segment.segmentMembers.reduce(
      (sum, member) => sum + (member.user.orders[0]?.total || 0),
      0
    );
    const avgSpent = totalMembers > 0 ? totalSpent / totalMembers : 0;

    return {
      segmentId: segment.id,
      segmentName: segment.name,
      totalMembers,
      totalSpent,
      avgSpent,
      isActive: segment.isActive,
      createdAt: segment.createdAt,
    };
  } catch (error) {
    console.error('[Get Segment Statistics Error]:', error);
    return null;
  }
}

// List all segments for an organization
export async function listOrganizationSegments(organizationId: string) {
  try {
    const segments = await prisma.marketingSegment.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { segmentMembers: true },
        },
      },
    });

    return segments.map((segment) => ({
      ...segment,
      memberCount: segment._count.segmentMembers,
    }));
  } catch (error) {
    console.error('[List Organization Segments Error]:', error);
    return [];
  }
}
