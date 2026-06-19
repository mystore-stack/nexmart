# Organization/Membership Architecture Root Cause Analysis

## Executive Summary

**PRIMARY ROOT CAUSE:** User registration creates users without Organization or Membership records, causing complete failure of multi-tenant data isolation.

**FAILURE CHAIN:** User Registration → No Organization Created → No Membership Created → getOrganizationIdForUser() Throws Error → Products/Addresses/Search Fail

---

## PHASE 1: Data Model Audit

### User Model Analysis
```prisma
model User {
  id               String            @id @default(uuid()) @db.Uuid
  email            String            @unique
  name             String
  password         String
  role             Role              @default(USER)
  // ... other fields
  
  // CRITICAL: NO direct organizationId field
  // Organization access is ONLY through Membership relation
  Membership       Membership[]
  Organization     Organization[] @relation("OrganizationOwner")
  
  @@index([email])
}
```

**Key Findings:**
- User has NO direct `organizationId` field
- User can exist without any Organization or Membership records
- Organization access is ONLY through Membership relation
- User can own Organizations (OrganizationOwner relation) but this is separate from Membership

### Organization Model Analysis
```prisma
model Organization {
  id                 String               @id @default(uuid()) @db.Uuid
  name               String
  slug               String               @unique
  ownerId            String               @db.Uuid  // REQUIRED
  // ... other fields
  
  User               User                 @relation("OrganizationOwner", fields: [ownerId], references: [id])
  Membership         Membership[]
  
  @@index([ownerId])
}
```

**Key Findings:**
- `ownerId` is REQUIRED (non-nullable)
- Organization must have an owner
- Organization has many Memberships
- Organization is NOT directly linked to Users except through owner relationship

### Membership Model Analysis
```prisma
model Membership {
  id             String       @id @default(uuid()) @db.Uuid
  userId         String       @db.Uuid  // REQUIRED
  organizationId String       @db.Uuid  // REQUIRED
  role           OrgRole      @default(MEMBER)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  Organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  User           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, organizationId])  // UNIQUE CONSTRAINT
  @@index([organizationId])
}
```

**Key Findings:**
- Both `userId` and `organizationId` are REQUIRED
- Unique constraint on [userId, organizationId] - one user can have one membership per organization
- Cascading deletes on both sides
- Role defaults to MEMBER
- This is the ONLY way for users to access organizations

### Relation Mapping
```
User (no organizationId)
  ↓ 1:N
Membership (userId, organizationId)
  ↓ N:1
Organization (ownerId, has many Memberships)
  ↓ 1:1
User (as owner)
```

### Orphan Record Scenarios
1. **User without Membership**: User exists but has no organization access
2. **User without Organization**: User exists but owns no organizations
3. **Organization without Members**: Organization exists but has no members (only owner)
4. **Membership without User**: Cannot happen due to cascading delete
5. **Membership without Organization**: Cannot happen due to cascading delete

---

## PHASE 2: Authentication Flow Audit

### Complete Login Flow
```
1. User submits credentials to /api/auth/login
2. Credentials validated against User.password
3. JWT tokens generated (access + refresh)
4. Tokens set in cookies (nexmart_auth, nexmart_refresh)
5. Session created in database (Session model)
6. NextAuth session created (if using NextAuth)
7. NO organization context loaded
8. NO membership records checked
9. NO organization resolution performed
```

### Flow Diagram
```
User Credentials
    ↓
Validate Password
    ↓
Generate JWT Tokens
    ↓
Set Auth Cookies
    ↓
Create Session Record
    ↓
Create NextAuth Session
    ↓
[STOP] - No organization loading
    ↓
Return User Session (userId, email, role only)
```

### Key Findings
- Authentication works correctly
- Session contains: userId, email, role
- Session does NOT contain: organizationId, membership info
- Organization resolution is deferred to API route level
- This is intentional for multi-tenant architecture but requires proper fallback

---

## PHASE 3: Organization Resolution Audit

### getOrganizationIdForUser() Function
**Location:** `src/lib/tenant.ts`

```typescript
export async function getOrganizationIdForUser(payload: Pick<AuthSession, "userId">) {
  console.log("[TENANT] Getting organizationId for userId:", payload.userId);
  
  // Step 1: Try to find Membership
  const membership = await prisma.membership.findFirst({
    where: { userId: payload.userId },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  if (membership) {
    console.log("[TENANT] Found membership, organizationId:", membership.organizationId);
    return membership.organizationId;
  }

  // Step 2: Try to find owned Organization
  const ownedOrganization = await prisma.organization.findFirst({
    where: { ownerId: payload.userId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (ownedOrganization) {
    console.log("[TENANT] Found owned organization, id:", ownedOrganization.id);
    return ownedOrganization.id;
  }

  // Step 3: CRITICAL - Throw error if no access
  console.error("[TENANT] CRITICAL: User has no membership and does not own any organization");
  console.error("[TENANT] userId:", payload.userId);
  console.error("[TENANT] Action: Create a Membership record or assign user as Organization owner");
  throw new Error(
    `User ${payload.userId} has no organization access. ` +
    `Please create a Membership record or assign the user as an Organization owner. ` +
    `This is required for multi-tenant data isolation.`
  );
}
```

### Failure Paths
1. **No Membership Record**: User has no membership → Step 1 fails
2. **No Owned Organization**: User owns no organization → Step 2 fails
3. **Both Missing**: User has neither membership nor organization → Step 3 throws error

### Silent Catches
- None - function throws explicit error
- Error message is clear and actionable
- No fallback to default organization (intentional for data isolation)

### Fallback Behavior
- **NO FALLBACK** - This is intentional to prevent data leakage
- Previous versions may have had fallback, but current version throws error
- This is correct for multi-tenant architecture but requires proper user setup

### Usage Locations
- `src/lib/auth-api.ts` - requireAuth() function
- `src/app/api/products/route.ts` - Product listing
- `src/app/api/audit/*/route.ts` - Audit endpoints
- `src/app/api/admin/diagnostics/tenant/route.ts` - Diagnostics
- Multiple other API routes

---

## PHASE 4: Membership Resolution Audit

### Membership Creation Analysis
**Registration Flow:** `src/app/api/auth/register/route.ts`

```typescript
export async function POST(req: NextRequest) {
  // ... validation ...
  
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });

  // CRITICAL: NO Membership creation here
  // CRITICAL: NO Organization creation here
  // CRITICAL: NO organization assignment here
  
  // Initialize welcome email series (uses user.organizationId which is undefined)
  initializeWelcomeSeries(user.id, user.organizationId || 'default').catch((error) => {
    console.error('[Welcome Series Initialization Error]:', error);
  });
  
  // ... return user ...
}
```

### Membership Lookup Analysis
- No automatic membership lookup during registration
- No membership lookup during login
- Membership lookup only happens when `getOrganizationIdForUser()` is called
- This is deferred to API route level

### Role Assignment Analysis
- User role defaults to USER in User model
- Membership role defaults to MEMBER in Membership model
- No automatic role elevation based on organization ownership
- Owner role is implicit through Organization.ownerId

### Owner Assignment Analysis
- Organization.ownerId is required field
- No automatic organization creation for users
- No automatic owner assignment
- Organization creation appears to be manual or through separate admin flow

### When Memberships Are Missing
- **Registration**: User created without membership
- **Login**: User authenticated without membership check
- **API Calls**: All tenant-scoped APIs fail when membership missing
- **Product Access**: Products disappear (getOrganizationIdForUser throws error)
- **Address Access**: Addresses work (no organization dependency)

### How Missing Memberships Affect Requests
1. **Product APIs**: Throw error "User has no organization access"
2. **Search APIs**: May work if using getDefaultOrganizationId()
3. **Address APIs**: Work (no organization dependency)
4. **Admin APIs**: May work if using default organization
5. **Audit APIs**: Throw error (require organization context)

---

## PHASE 5: Product Access Audit

### Product Query Analysis
**Location:** `src/app/api/products/route.ts`

```typescript
export async function GET(req: NextRequest) {
  const session = await getSession();
  let organizationId;
  
  if (session) {
    // CRITICAL: This will throw error if user has no membership
    organizationId = await getOrganizationIdForUser({ userId: session.userId });
  } else {
    // Fallback for unauthenticated users
    organizationId = await getDefaultOrganizationId();
  }

  const where: any = {
    organizationId,  // CRITICAL: Tenant isolation filter
    published: true,
    // ... other filters
  };

  const products = await prisma.product.findMany({ where });
}
```

### Organization Filters
- **Primary Filter**: `organizationId` in WHERE clause
- **Category Filter**: `category.organizationId` in WHERE clause
- **Tenant Isolation**: All product queries scoped to organizationId

### Membership Filters
- **No direct membership filter** on products
- **Membership used only to resolve organizationId**
- **Once organizationId resolved, products filtered by organizationId**

### Tenant Filters
- **Product.organizationId** - Required field
- **Category.organizationId** - Required field
- **All product queries** scoped to organizationId
- **No cross-organization product access**

### Why Products Disappear
1. User has no Membership record
2. User has no owned Organization
3. getOrganizationIdForUser() throws error
4. API route catches error and returns 500 or error message
5. Frontend shows no products or error state

### Exact Failure Path
```
User requests products
    ↓
API route checks session
    ↓
Session exists (user authenticated)
    ↓
Calls getOrganizationIdForUser()
    ↓
Queries Membership table → No results
    ↓
Queries Organization table (owned) → No results
    ↓
Throws error: "User has no organization access"
    ↓
API returns error response
    ↓
Frontend shows no products
```

---

## PHASE 6: Address System Audit

### Address Creation Flow
**Location:** `src/app/api/auth/addresses/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  
  // CRITICAL: No organization dependency
  const address = await prisma.address.create({
    data: {
      ...data,
      userId: session.userId,  // Only userId required
    },
  });
}
```

### Address Update Flow
- Similar to creation
- No organization dependency
- Only requires userId

### Address Retrieval Flow
```typescript
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  
  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },  // Only userId filter
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}
```

### Organization Dependency
- **NONE** - Address operations do NOT depend on organization
- Address model has NO organizationId field
- Address only requires userId
- This is intentional - addresses are user-scoped, not tenant-scoped

### Membership Dependency
- **NONE** - Address operations do NOT depend on membership
- Only requires valid session (userId)
- Should work even without organization access

### User Role Dependency
- **NONE** - Address operations do NOT depend on user role
- Any authenticated user can manage their addresses
- This is correct design

### Why Address Operations May Fail
- **Should NOT fail** due to organization/membership
- May fail due to:
  - Invalid session
  - Database connection issues
  - Validation errors
  - Foreign key violations (if userId doesn't exist)
- **NOT due to missing organization access**

---

## PHASE 7: Root Cause Determination

### PRIMARY ROOT CAUSE
**User registration creates users without Organization or Membership records, causing complete failure of multi-tenant data isolation.**

### SECONDARY ROOT CAUSES
1. **No automatic Organization creation** during user registration
2. **No automatic Membership creation** during user registration
3. **No default Organization assignment** for new users
4. **No bootstrap mechanism** to ensure at least one Organization exists
5. **No migration** to repair existing orphaned users
6. **No defensive checks** in registration to prevent orphaned users

### FAILURE CHAIN DIAGRAM
```
A. User Registration
   ↓
B. User Created (no Organization, no Membership)
   ↓
C. User Authenticates Successfully
   ↓
D. User Attempts to Access Products
   ↓
E. API Route Calls getOrganizationIdForUser()
   ↓
F. Membership Lookup Fails (no membership record)
   ↓
G. Owned Organization Lookup Fails (no owned organization)
   ↓
H. Function Throws Error: "User has no organization access"
   ↓
I. API Returns Error Response
   ↓
J. Frontend Shows No Products/Error State
```

### FAILURE CHAIN (TEXT)
`User Registration → No Organization Created → No Membership Created → User Authenticates → getOrganizationIdForUser() Throws Error → Products/Addresses/Search Fail`

### CRITICAL ARCHITECTURAL GAP
The application assumes all users will have either:
1. A Membership record (member of an organization), OR
2. An owned Organization record (owner of an organization)

But registration creates users with NEITHER, violating this assumption.

---

## PHASE 8: Exact Fixes

### FIX 1: Registration Flow - Auto-Create Organization and Membership

**FILE:** `src/app/api/auth/register/route.ts`

**CURRENT CODE:**
```typescript
const hashed = await bcrypt.hash(password, 12);
const user = await prisma.user.create({
  data: { name, email, password: hashed },
  select: { id: true, email: true, name: true, role: true, avatar: true },
});

// Initialize welcome email series
initializeWelcomeSeries(user.id, user.organizationId || 'default').catch((error) => {
  console.error('[Welcome Series Initialization Error]:', error);
});
```

**REPLACE WITH:**
```typescript
const hashed = await bcrypt.hash(password, 12);

// Step 1: Create user
const user = await prisma.user.create({
  data: { name, email, password: hashed },
  select: { id: true, email: true, name: true, role: true, avatar: true },
});

// Step 2: Get or create default organization
let organizationId: string;
try {
  organizationId = await getDefaultOrganizationId();
  console.log('[REGISTRATION] Using existing default organization:', organizationId);
} catch {
  // Create default organization if it doesn't exist
  console.log('[REGISTRATION] Creating default organization');
  const organization = await prisma.organization.create({
    data: {
      name: 'NexMart Default',
      slug: 'nexmart',
      ownerId: user.id,
      status: 'ACTIVE',
    },
  });
  organizationId = organization.id;
  console.log('[REGISTRATION] Created default organization:', organizationId);
}

// Step 3: Create membership for user
const membership = await prisma.membership.create({
  data: {
    userId: user.id,
    organizationId: organizationId,
    role: 'MEMBER',
  },
});
console.log('[REGISTRATION] Created membership:', membership.id);

// Step 4: Initialize welcome email series with correct organizationId
initializeWelcomeSeries(user.id, organizationId).catch((error) => {
  console.error('[Welcome Series Initialization Error]:', error);
});
```

**RATIONALE:**
- Ensures every new user has organization access
- Creates default organization if it doesn't exist
- Creates membership record for user
- Fixes welcome series initialization with correct organizationId
- Prevents orphaned users from registration

---

### FIX 2: Database Repair SQL Script

**FILE:** Create new file `prisma/repair-orphaned-users.sql`

**SQL SCRIPT:**
```sql
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
WHERE u.email = 'my178store@gmail.com'  -- Replace with admin email
AND NOT EXISTS (SELECT 1 FROM "Organization" WHERE slug = 'nexmart')
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- Step 3: Get default organization ID
DO $$
DECLARE
  default_org_id UUID;
  admin_user_id UUID;
BEGIN
  SELECT id INTO default_org_id FROM "Organization" WHERE slug = 'nexmart' LIMIT 1;
  SELECT id INTO admin_user_id FROM "User" WHERE email = 'my178store@gmail.com' LIMIT 1;
  
  -- Step 4: Create memberships for all orphaned users
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
  
  RAISE NOTICE 'Repaired % orphaned users', (SELECT COUNT(*) FROM "User" u LEFT JOIN "Membership" m ON m."userId" = u.id WHERE m.id IS NULL);
END $$;

-- Step 5: Verify repair
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
```

**RATIONALE:**
- Identifies all orphaned users
- Creates default organization if missing
- Assigns all orphaned users to default organization
- Uses admin user as organization owner
- Prevents duplicate memberships with ON CONFLICT
- Provides verification query

---

### FIX 3: Prisma Migration for Bootstrap

**FILE:** Create new Prisma migration file

**MIGRATION COMMAND:**
```bash
npx prisma migrate dev --name add_organization_bootstrap
```

**MIGRATION SQL (in prisma/migrations/xxx_add_organization_bootstrap/migration.sql):**
```sql
-- Create default organization if it doesn't exist
INSERT INTO "Organization" (id, name, slug, "ownerId", status, "createdAt", "updatedAt")
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid as id,
  'NexMart Default' as name,
  'nexmart' as slug,
  (SELECT id FROM "User" WHERE email = 'my178store@gmail.com' LIMIT 1) as "ownerId",
  'ACTIVE' as status,
  NOW() as "createdAt",
  NOW() as "updatedAt"
WHERE NOT EXISTS (SELECT 1 FROM "Organization" WHERE slug = 'nexmart')
ON CONFLICT (slug) DO NOTHING;

-- Create function to repair orphaned users
CREATE OR REPLACE FUNCTION repair_orphaned_users()
RETURNS INTEGER AS $$
DECLARE
  default_org_id UUID;
  repaired_count INTEGER;
BEGIN
  SELECT id INTO default_org_id FROM "Organization" WHERE slug = 'nexmart' LIMIT 1;
  
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
  RETURN repaired_count;
END;
$$ LANGUAGE plpgsql;

-- Run repair function
SELECT repair_orphaned_users() as repaired_users;
```

**RATIONALE:**
- Provides automated bootstrap mechanism
- Creates default organization on migration
- Includes repair function for orphaned users
- Can be run in production safely
- Uses ON CONFLICT to prevent duplicates

---

### FIX 4: Service Layer - Add Bootstrap Function

**FILE:** `src/lib/tenant.ts`

**CURRENT CODE:**
```typescript
export async function getOrganizationIdForUser(payload: Pick<AuthSession, "userId">) {
  // ... existing code ...
  throw new Error(
    `User ${payload.userId} has no organization access. ` +
    `Please create a Membership record or assign the user as an Organization owner. ` +
    `This is required for multi-tenant data isolation.`
  );
}
```

**REPLACE WITH:**
```typescript
export async function getOrganizationIdForUser(payload: Pick<AuthSession, "userId">) {
  console.log("[TENANT] Getting organizationId for userId:", payload.userId);
  
  const membership = await prisma.membership.findFirst({
    where: { userId: payload.userId },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  if (membership) {
    console.log("[TENANT] Found membership, organizationId:", membership.organizationId);
    return membership.organizationId;
  }

  const ownedOrganization = await prisma.organization.findFirst({
    where: { ownerId: payload.userId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (ownedOrganization) {
    console.log("[TENANT] Found owned organization, id:", ownedOrganization.id);
    return ownedOrganization.id;
  }

  // NEW: Auto-repair - Create membership to default organization
  console.warn("[TENANT] User has no organization access, attempting auto-repair");
  try {
    const defaultOrgId = await getDefaultOrganizationId();
    const membership = await prisma.membership.create({
      data: {
        userId: payload.userId,
        organizationId: defaultOrgId,
        role: 'MEMBER',
      },
    });
    console.log("[TENANT] Auto-repair successful: Created membership", membership.id);
    return defaultOrgId;
  } catch (repairError) {
    console.error("[TENANT] Auto-repair failed:", repairError);
    throw new Error(
      `User ${payload.userId} has no organization access. ` +
      `Auto-repair failed. Please create a Membership record or assign user as Organization owner. ` +
      `This is required for multi-tenant data isolation.`
    );
  }
}

// NEW: Bootstrap function to ensure organization exists
export async function bootstrapOrganization(): Promise<string> {
  try {
    const orgId = await getDefaultOrganizationId();
    console.log("[TENANT] Organization already exists:", orgId);
    return orgId;
  } catch {
    console.log("[TENANT] Creating bootstrap organization");
    const organization = await prisma.organization.create({
      data: {
        name: 'NexMart Default',
        slug: 'nexmart',
        ownerId: (await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } }))?.id || '',
        status: 'ACTIVE',
      },
    });
    console.log("[TENANT] Bootstrap organization created:", organization.id);
    return organization.id;
  }
}
```

**RATIONALE:**
- Adds auto-repair mechanism for orphaned users
- Attempts to create membership to default organization
- Provides bootstrap function for organization creation
- Maintains data isolation while providing fallback
- Logs all repair attempts for debugging

---

### FIX 5: Middleware - Add Organization Bootstrap

**FILE:** `src/middleware.ts`

**CURRENT CODE:**
```typescript
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", generateRequestId());

  const session = await auth();
  // ... existing code ...

  return response;
}
```

**REPLACE WITH:**
```typescript
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  console.log("[MIDDLEWARE] Request:", { pathname, isApiRoute });

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", generateRequestId());

  // NEW: Bootstrap organization on first request if needed
  if (!isApiRoute && pathname === "/") {
    try {
      const { bootstrapOrganization } = await import("@/lib/tenant");
      await bootstrapOrganization();
      console.log("[MIDDLEWARE] Organization bootstrap completed");
    } catch (error) {
      console.error("[MIDDLEWARE] Organization bootstrap failed:", error);
      // Don't block request, just log error
    }
  }

  const session = await auth();
  // ... existing code ...

  return response;
}
```

**RATIONALE:**
- Ensures organization exists on first page load
- Non-blocking - doesn't fail if bootstrap fails
- Only runs on home page to avoid overhead
- Provides safety net for production deployments

---

### FIX 6: API Route - Add Defensive Check

**FILE:** `src/app/api/products/route.ts`

**CURRENT CODE:**
```typescript
const session = await getSession();
let organizationId;
if (session) {
  organizationId = await getOrganizationIdForUser({ userId: session.userId });
} else {
  organizationId = await getDefaultOrganizationId();
}
```

**REPLACE WITH:**
```typescript
const session = await getSession();
let organizationId;
if (session) {
  try {
    organizationId = await getOrganizationIdForUser({ userId: session.userId });
  } catch (orgError) {
    console.error("[PRODUCTS API] Organization resolution failed:", orgError);
    // Fallback to default organization for better UX
    try {
      organizationId = await getDefaultOrganizationId();
      console.warn("[PRODUCTS API] Using default organization fallback");
    } catch (defaultError) {
      console.error("[PRODUCTS API] Default organization also missing:", defaultError);
      return NextResponse.json(
        { success: false, error: "System configuration error: No organization found" },
        { status: 500 }
      );
    }
  }
} else {
  organizationId = await getDefaultOrganizationId();
}
```

**RATIONALE:**
- Adds defensive error handling
- Provides fallback to default organization
- Prevents complete failure if organization resolution fails
- Maintains data isolation while providing graceful degradation
- Better user experience than hard error

---

### FIX 7: Schema Enhancement (Optional but Recommended)

**FILE:** `prisma/schema.prisma`

**CURRENT CODE:**
```prisma
model User {
  id               String            @id @default(uuid()) @db.Uuid
  email            String            @unique
  name             String
  password         String
  role             Role              @default(USER)
  // ... other fields
}
```

**REPLACE WITH:**
```prisma
model User {
  id               String            @id @default(uuid()) @db.Uuid
  email            String            @unique
  name             String
  password         String
  role             Role              @default(USER)
  // ... existing fields ...
  
  // NEW: Optional direct organizationId for performance
  // This is a cache field, not the source of truth
  defaultOrganizationId String?      @db.Uuid
  
  // ... existing relations ...
  Membership       Membership[]
  Organization     Organization[] @relation("OrganizationOwner")
  
  @@index([email])
  @@index([defaultOrganizationId])
}
```

**RATIONALE:**
- Adds optional direct organizationId for performance
- Reduces database queries for organization resolution
- Still uses Membership as source of truth
- Can be populated by trigger or application logic
- Provides optimization for high-traffic scenarios

---

## Verification Checklist

### Pre-Deployment Verification
- [ ] Run SQL repair script in development
- [ ] Verify all users have membership records
- [ ] Verify default organization exists
- [ ] Test registration flow creates membership
- [ ] Test product access with new users
- [ ] Test address access with new users
- [ ] Test search with new users
- [ ] Test admin diagnostics

### Production Deployment Steps
1. **Backup Database**
   ```bash
   pg_dump $DATABASE_URL > backup_before_fix.sql
   ```

2. **Run Repair Script**
   ```bash
   psql $DATABASE_URL < prisma/repair-orphaned-users.sql
   ```

3. **Apply Code Changes**
   - Deploy updated registration route
   - Deploy updated tenant.ts
   - Deploy updated middleware
   - Deploy updated product API

4. **Run Migration**
   ```bash
   npx prisma migrate deploy
   ```

5. **Verify Production**
   - Test registration
   - Test product access
   - Check logs for repair attempts
   - Verify no orphaned users remain

### Post-Deployment Verification
- [ ] Monitor error logs for organization resolution failures
- [ ] Monitor registration success rate
- [ ] Verify product access for new users
- [ ] Check that auto-repair is working
- [ ] Verify no data leakage between organizations
- [ ] Performance impact assessment

---

## Summary

### Root Cause
User registration creates users without Organization or Membership records, violating the multi-tenant architecture assumption that all users have organization access.

### Impact
- Products disappear for users without organization access
- Search may fail depending on implementation
- Addresses work (no organization dependency)
- Complete failure of tenant isolation

### Solution
1. Fix registration to auto-create organization and membership
2. Add database repair script for existing orphaned users
3. Add auto-repair mechanism in tenant resolution
4. Add bootstrap mechanism for organization creation
5. Add defensive error handling in API routes
6. Optional: Add direct organizationId to User model for performance

### Risk Assessment
- **Low Risk**: Registration fix (only affects new users)
- **Medium Risk**: Auto-repair mechanism (changes existing behavior)
- **Low Risk**: Bootstrap mechanism (non-blocking)
- **Low Risk**: Defensive error handling (graceful degradation)
- **Medium Risk**: Schema change (requires migration)

### Rollback Plan
1. Revert code changes
2. Database changes are additive (can be kept)
3. Auto-repair can be disabled by removing try-catch
4. Bootstrap can be disabled by removing middleware call
