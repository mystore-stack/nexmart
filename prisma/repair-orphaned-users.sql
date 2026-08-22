-- Database Repair Script for Orphaned Users
-- This script repairs users who have no Organization or Membership records
-- Run this in your PostgreSQL database to fix existing orphaned users

-- Step 1: Check for orphaned users (users without membership or owned organization)
SELECT 
  u.id as user_id,
  u.email as user_email,
  u.name as user_name,
  u.role as user_role,
  u.created_at as user_created_at
FROM "User" u
LEFT JOIN "Membership" m ON m."userId" = u.id
LEFT JOIN "Organization" o ON o."ownerId" = u.id
WHERE m.id IS NULL AND o.id IS NULL;

-- Step 2: Create default organization if it doesn't exist
-- Replace 'my178store@gmail.com' with your admin email
INSERT INTO "Organization" (id, name, slug, "ownerId", status, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid() as id,
  'NexMart Default' as name,
  'nexmart' as slug,
  u.id as "ownerId",
  'ACTIVE' as status,
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "User" u
WHERE u.email = 'my178store@gmail.com'  -- REPLACE WITH YOUR ADMIN EMAIL
AND NOT EXISTS (SELECT 1 FROM "Organization" WHERE slug = 'nexmart')
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- Step 3: Get default organization ID and repair orphaned users
DO $$
DECLARE
  default_org_id UUID;
  admin_user_id UUID;
  repaired_count INTEGER;
BEGIN
  -- Get default organization ID
  SELECT id INTO default_org_id FROM "Organization" WHERE slug = 'nexmart' LIMIT 1;
  
  IF default_org_id IS NULL THEN
    RAISE EXCEPTION 'Default organization not found. Please ensure an organization with slug "nexmart" exists.';
  END IF;
  
  -- Get admin user ID (first user or specific email)
  SELECT id INTO admin_user_id FROM "User" WHERE email = 'my178store@gmail.com' LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    -- Fallback to first user if admin email not found
    SELECT id INTO admin_user_id FROM "User" ORDER BY created_at ASC LIMIT 1;
  END IF;
  
  -- Update default organization owner if needed
  UPDATE "Organization" 
  SET "ownerId" = admin_user_id 
  WHERE slug = 'nexmart' AND "ownerId" IS NULL;
  
  -- Create memberships for all orphaned users
  INSERT INTO "Membership" (id, "userId", "organizationId", role, "createdAt", "updatedAt")
  SELECT 
    gen_random_uuid() as id,
    u.id as "userId",
    default_org_id as "organizationId",
    'MEMBER' as role,
    NOW() as "createdAt",
    NOW() as "updatedAt"
  FROM "User" u
  LEFT JOIN "Membership" m ON m."userId" = u.id
  WHERE m.id IS NULL
  ON CONFLICT ("userId", "organizationId") DO NOTHING;
  
  GET DIAGNOSTICS repaired_count = ROW_COUNT;
  RAISE NOTICE 'Repaired % orphaned users', repaired_count;
END $$;

-- Step 4: Verify repair
SELECT 
  u.id as user_id,
  u.email as user_email,
  m.id as membership_id,
  m.role as membership_role,
  o.id as organization_id,
  o.name as organization_name
FROM "User" u
LEFT JOIN "Membership" m ON m."userId" = u.id
LEFT JOIN "Organization" o ON o.id = m."organizationId"
ORDER BY u.created_at DESC
LIMIT 20;

-- Step 5: Count remaining orphaned users (should be 0)
SELECT COUNT(*) as remaining_orphaned_users
FROM "User" u
LEFT JOIN "Membership" m ON m."userId" = u.id
LEFT JOIN "Organization" o ON o."ownerId" = u.id
WHERE m.id IS NULL AND o.id IS NULL;
