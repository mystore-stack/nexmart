import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function repairOrphanedUsers() {
  console.log('[REPAIR] Starting orphaned users repair...');
  
  try {
    // Step 1: Check for orphaned users
    const orphanedUsers = await prisma.$queryRaw`
      SELECT 
        u.id as user_id,
        u.email as user_email,
        u.name as user_name,
        u.role as user_role,
        u."createdAt" as user_created_at
      FROM "User" u
      LEFT JOIN "Membership" m ON m."userId" = u.id
      LEFT JOIN "Organization" o ON o."ownerId" = u.id
      WHERE m.id IS NULL AND o.id IS NULL
    `;
    
    console.log(`[REPAIR] Found ${orphanedUsers.length} orphaned users`);
    
    if (orphanedUsers.length === 0) {
      console.log('[REPAIR] No orphaned users found. Exiting.');
      return;
    }
    
    // Step 2: Get or create default organization
    let defaultOrg = await prisma.organization.findUnique({
      where: { slug: 'nexmart' },
    });
    
    if (!defaultOrg) {
      console.log('[REPAIR] Creating default organization...');
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      
      if (!firstUser) {
        throw new Error('Cannot create organization: No users found in database');
      }
      
      defaultOrg = await prisma.organization.create({
        data: {
          name: 'NexMart Default',
          slug: 'nexmart',
          ownerId: firstUser.id,
          status: 'ACTIVE',
        },
      });
      console.log(`[REPAIR] Created default organization: ${defaultOrg.id}`);
    } else {
      console.log(`[REPAIR] Using existing default organization: ${defaultOrg.id}`);
    }
    
    // Step 3: Create memberships for orphaned users
    let repairedCount = 0;
    for (const user of orphanedUsers as any[]) {
      try {
        await prisma.membership.create({
          data: {
            userId: user.user_id,
            organizationId: defaultOrg.id,
            role: 'MEMBER',
          },
        });
        repairedCount++;
        console.log(`[REPAIR] Created membership for user: ${user.user_email}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`[REPAIR] User ${user.user_email} already has membership`);
        } else {
          console.error(`[REPAIR] Failed to create membership for ${user.user_email}:`, error.message);
        }
      }
    }
    
    console.log(`[REPAIR] Successfully repaired ${repairedCount} orphaned users`);
    
    // Step 4: Verification
    const remainingOrphaned = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "User" u
      LEFT JOIN "Membership" m ON m."userId" = u.id
      LEFT JOIN "Organization" o ON o."ownerId" = u.id
      WHERE m.id IS NULL AND o.id IS NULL
    `;
    
    console.log(`[REPAIR] Remaining orphaned users: ${(remainingOrphaned as any)[0].count}`);
    
  } catch (error) {
    console.error('[REPAIR] Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

repairOrphanedUsers()
  .then(() => {
    console.log('[REPAIR] Repair completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[REPAIR] Repair failed:', error);
    process.exit(1);
  });
