# PHASE 10: MULTI-TENANT SAAS ARCHITECTURE - DESIGN

## System Overview

The Multi-Tenant SaaS Architecture transforms NexMart from a single-tenant application into a scalable, multi-tenant SaaS platform. It provides complete tenant isolation, organization management, role-based access control, and store-specific branding.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│              Global Admin Dashboard                       │
│              (Super Admin Only)                           │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Tenant      │  │  Billing    │
│  Manager    │  │  System    │
│  (RBAC)      │  │  (Stripe)  │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Feature    │  │  Usage      │
│  Flag       │  │  Metering   │
│  System     │  │  System    │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Tenant A   │  │  Tenant B   │
│  (Org 1)    │  │  (Org 2)    │
│  - Products │  │  - Products │
│  - Orders   │  │  - Orders   │
│  - Users    │  │  - Users    │
└─────────────┘  └─────────────┘
```

### Tenant Isolation Strategy
- **Database Level**: Row-level security with organizationId on all tables
- **API Level**: Middleware enforces tenant context on all requests
- **Cache Level**: Redis keys prefixed with organizationId
- **File Storage**: S3 paths organized by organizationId

## 2. Prisma Schema Updates

### Existing Organization Model Enhancements
```prisma
model Organization {
  id             String   @id @default(uuid()) @db.Uuid
  name           String
  slug           String   @unique
  ownerId        String   @db.Uuid
  
  // SaaS-specific fields
  planId         String?  @db.Uuid
  subscriptionId String?  @unique @db.Uuid
  status         OrganizationStatus @default(ACTIVE)
  
  // Branding
  logo           String?
  primaryColor   String?
  customDomain   String?  @unique
  
  // Usage tracking
  createdAt      DateTime @default(now())
  trialEndsAt    DateTime?
  
  // Relations
  owner          User     @relation("OrganizationOwner", fields: [ownerId], references: [id])
  plan           Plan?    @relation(fields: [planId], references: [id])
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  members       Membership[]
  usageRecords   UsageRecord[]
  
  // ... existing relations
  
  @@index([ownerId])
  @@index([slug])
  @@index([planId])
  @@index([status])
}

enum OrganizationStatus {
  ACTIVE
  SUSPENDED
  CANCELLED
  TRIAL
}
```

### New Models
```prisma
model Plan {
  id             String   @id @default(uuid()) @db.Uuid
  name           String
  slug           String   @unique
  description    String?
  
  // Pricing
  monthlyPrice   Float
  yearlyPrice    Float
  currency       String   @default("USD")
  
  // Trial
  trialDays      Int      @default(14)
  
  // Limits
  limits         Json     // { users: 10, products: 100, orders: 1000, aiCalls: 1000, emails: 5000 }
  
  // Features
  features       Json     // { aiInsights: true, cro: false, advancedBI: false }
  
  // Metadata
  stripePriceId  String?  @unique
  stripeYearlyPriceId String? @unique
  active         Boolean  @default(true)
  
  // Relations
  organizations  Organization[]
  subscriptions  Subscription[]
  
  @@index([active])
}

model Subscription {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid @unique
  planId         String   @db.Uuid
  
  // Billing
  stripeSubscriptionId String? @unique
  status         SubscriptionStatus @default(TRIAL)
  
  // Billing cycle
  billingCycle   BillingCycle
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  
  // Trial
  trialEndsAt    DateTime?
  
  // Cancellation
  cancelAtPeriodEnd Boolean @default(false)
  cancelledAt    DateTime?
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  plan           Plan     @relation(fields: [planId], references: [id])
  
  @@index([status])
  @@index([currentPeriodEnd])
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
  INCOMPLETE
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

model Membership {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  userId         String   @db.Uuid
  role           MembershipRole @default(MEMBER)
  
  // Status
  status         MembershipStatus @default(ACTIVE)
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([organizationId, userId])
  @@index([organizationId, role])
  @@index([userId])
}

enum MembershipRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum MembershipStatus {
  ACTIVE
  INVITED
  SUSPENDED
}

model UsageRecord {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  metric         UsageMetric
  quantity       Int      @default(0)
  
  // Period
  periodStart    DateTime
  periodEnd      DateTime
  
  // Timestamps
  recordedAt     DateTime @default(now())
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId, metric, periodStart])
  @@index([periodStart, periodEnd])
}

enum UsageMetric {
  API_CALLS
  AI_REQUESTS
  EMAILS_SENT
  ORDERS_PROCESSED
  STORAGE_BYTES
  ACTIVE_USERS
}

model FeatureFlag {
  id             String   @id @default(uuid()) @db.Uuid
  key            String   @unique
  name           String
  description    String?
  
  // Configuration
  enabled        Boolean  @default(false)
  rolloutPercentage Float @default(0)
  
  // Targeting
  targetPlans    Json?    // ["GROWTH", "PRO"]
  targetOrganizations Json? // ["org-id-1", "org-id-2"]
  
  // Metadata
  category       String?
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([enabled])
  @@index([category])
}

model AuditLog {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  userId         String   @db.Uuid
  
  // Action
  action         String
  entityType     String
  entityId       String
  
  // Details
  changes        Json?
  ipAddress      String?
  userAgent      String?
  
  // Timestamps
  createdAt      DateTime @default(now())
  
  // Relations
  organization   Organization @relation("OrganizationAuditLogs", fields: [organizationId], references: [id], onDelete: Cascade)
  user           User     @relation("UserAuditLogs", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([organizationId, createdAt])
  @@index([userId, createdAt])
  @@index([entityType, entityId])
}
```

### Model Updates
```prisma
model Organization {
  // ... existing fields
  auditLogs      AuditLog[]
}

model User {
  // ... existing fields
  auditLogs      AuditLog[]
}
```

## 3. API Endpoints

### Organization Management
```typescript
// POST /api/saas/organizations
interface CreateOrganizationRequest {
  name: string;
  slug: string;
  planId?: string;
}

interface CreateOrganizationResponse {
  success: boolean;
  organization: Organization;
  subscription: Subscription;
}
```

### Subscription Management
```typescript
// POST /api/saas/subscriptions/create-checkout
interface CreateCheckoutRequest {
  planId: string;
  billingCycle: BillingCycle;
}

interface CreateCheckoutResponse {
  success: boolean;
  checkoutUrl: string;
}

// POST /api/saas/subscriptions/cancel
interface CancelSubscriptionResponse {
  success: boolean;
  subscription: Subscription;
}
```

### Membership Management
```typescript
// POST /api/saas/organizations/[orgId]/members
interface InviteMemberRequest {
  email: string;
  role: MembershipRole;
}

interface InviteMemberResponse {
  success: boolean;
  membership: Membership;
}

// PATCH /api/saas/organizations/[orgId]/members/[memberId]
interface UpdateMemberRequest {
  role: MembershipRole;
}

interface UpdateMemberResponse {
  success: boolean;
  membership: Membership;
}
```

### Feature Flags
```typescript
// GET /api/saas/feature-flags
interface GetFeatureFlagsResponse {
  success: boolean;
  flags: FeatureFlag[];
}

// POST /api/saas/feature-flags
interface CreateFeatureFlagRequest {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  targetPlans?: string[];
}

interface CreateFeatureFlagResponse {
  success: boolean;
  flag: FeatureFlag;
}
```

### Usage Tracking
```typescript
// GET /api/saas/usage
interface GetUsageResponse {
  success: boolean;
  usage: {
    currentPeriod: {
      start: DateTime;
      end: DateTime;
    };
    metrics: Record<UsageMetric, {
      used: number;
      limit: number;
      percentage: number;
    }>;
  };
}
```

## 4. Middleware & Guards

### Tenant Context Middleware
```typescript
// src/lib/middleware/tenant-context.ts
export async function withTenantContext(req: NextRequest) {
  const session = await getSession(req);
  
  if (!session?.organizationId) {
    throw new AuthError('No organization context');
  }
  
  // Validate organization exists and is active
  const organization = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    include: { subscription: true },
  });
  
  if (!organization || organization.status === 'CANCELLED') {
    throw new AuthError('Organization not found or cancelled');
  }
  
  // Check subscription status
  if (organization.subscription?.status === 'PAST_DUE') {
    throw new AuthError('Subscription past due');
  }
  
  return { organization, subscription: organization.subscription };
}
```

### Feature Flag Guard
```typescript
// src/lib/guards/feature-flag.ts
export function requireFeature(featureKey: string) {
  return async ({ session }: { session: Session }) => {
    const organization = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      include: { plan: true },
    });
    
    const flag = await prisma.featureFlag.findUnique({
      where: { key: featureKey },
    });
    
    if (!flag || !flag.enabled) {
      throw new AuthError('Feature not available');
    }
    
    // Check plan eligibility
    if (flag.targetPlans) {
      const planName = organization.plan?.name;
      if (!flag.targetPlans.includes(planName)) {
        throw new AuthError('Feature not available in your plan');
      }
    }
    
    return true;
  };
}
```

### Usage Limit Guard
```typescript
// src/lib/guards/usage-limit.ts
export function checkUsageLimit(metric: UsageMetric) {
  return async ({ session }: { session: Session }) => {
    const organization = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      include: { plan: true },
    });
    
    const limits = organization.plan?.limits as any;
    const limit = limits[metric];
    
    if (!limit) return true; // No limit set
    
    const currentUsage = await getCurrentUsage(session.organizationId, metric);
    
    if (currentUsage >= limit) {
      throw new AuthError(`Usage limit exceeded for ${metric}`);
    }
    
    return true;
  };
}
```

## 5. Frontend Dashboards

### Global Admin Dashboard
```typescript
// /admin/platform
- Total revenue across all tenants
- Active subscriptions
- Churn rate
- MRR / ARR
- Top performing stores
- System usage metrics
- Tenant management
```

### Organization Settings
```typescript
// /admin/settings/organization
- Organization details
- Branding (logo, colors, custom domain)
- Subscription management
- Billing history
- Plan upgrade/downgrade
```

### Team Management
```typescript
// /admin/settings/team
- Team members list
- Invite new members
- Role management
- Member permissions
```

### Usage Dashboard
```typescript
// /admin/usage
- Current usage metrics
- Usage limits
- Usage trends
- Upgrade prompts
```

## 6. Billing Logic

### Plan Configuration
```typescript
// Starter Plan
{
  monthlyPrice: 29,
  yearlyPrice: 290,
  limits: {
    users: 3,
    products: 100,
    orders: 1000,
    aiCalls: 100,
    emails: 1000,
  },
  features: {
    aiInsights: false,
    cro: false,
    advancedBI: false,
    personalization: false,
  }
}

// Growth Plan
{
  monthlyPrice: 99,
  yearlyPrice: 990,
  limits: {
    users: 10,
    products: 1000,
    orders: 10000,
    aiCalls: 1000,
    emails: 10000,
  },
  features: {
    aiInsights: true,
    cro: true,
    advancedBI: false,
    personalization: true,
  }
}

// Pro Plan
{
  monthlyPrice: 299,
  yearlyPrice: 2990,
  limits: {
    users: 25,
    products: 10000,
    orders: 100000,
    aiCalls: 10000,
    emails: 50000,
  },
  features: {
    aiInsights: true,
    cro: true,
    advancedBI: true,
    personalization: true,
  }
}

// Enterprise Plan
{
  monthlyPrice: 999,
  yearlyPrice: 9990,
  limits: {
    users: 100,
    products: -1, // Unlimited
    orders: -1,
    aiCalls: -1,
    emails: -1,
  },
  features: {
    aiInsights: true,
    cro: true,
    advancedBI: true,
    personalization: true,
    customDomain: true,
    apiAccess: true,
  }
}
```

## 7. Feature Gating Logic

### Feature Access Check
```typescript
// src/lib/saas/feature-access.ts
export async function checkFeatureAccess(
  organizationId: string,
  featureKey: string
): Promise<boolean> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { plan: true },
  });
  
  const flag = await prisma.featureFlag.findUnique({
    where: { key: featureKey },
  });
  
  if (!flag || !flag.enabled) return false;
  
  // Check plan eligibility
  if (flag.targetPlans) {
    const planName = organization.plan?.name;
    return flag.targetPlans.includes(planName);
  }
  
  // Check organization-specific targeting
  if (flag.targetOrganizations) {
    return flag.targetOrganizations.includes(organizationId);
  }
  
  return true;
}
```

## 8. Security Model

### Row-Level Security Strategy
- All queries must include `organizationId` filter
- Middleware enforces tenant context
- Audit logs track all data access
- No cross-tenant data sharing

### API Security
- All API routes validate organization context
- Feature flags checked before feature access
- Usage limits enforced on all operations
- Rate limiting per organization

### Data Isolation
- Database: Row-level with organizationId
- Cache: Redis keys prefixed with organizationId
- Storage: S3 paths organized by organizationId
- Search: Organization-scoped indices

## 9. Scalability Considerations

### Database Scaling
- Read replicas for analytics queries
- Connection pooling per tenant
- Query optimization with proper indexes
- Archive old data for inactive tenants

### Cache Strategy
- Tenant-specific cache keys
- Cache invalidation on plan changes
- Feature flag caching with TTL
- Usage metrics aggregation caching

### API Rate Limiting
- Per-organization rate limits
- Plan-based rate tiers
- Burst allowance for enterprise
- Rate limit headers in responses

## 10. Deployment Strategy

### Pre-Deployment
- [ ] Prisma schema migration applied
- [ ] Seed plans and feature flags
- [ ] Stripe webhook endpoints configured
- [ ] Redis cache configured for tenant isolation
- [ ] S3 bucket policies updated for tenant paths

### Deployment
- [ ] Deploy API endpoints
- [ ] Deploy middleware and guards
- [ ] Run database migration
- [ ] Seed initial plans
- [ ] Configure Stripe webhooks

### Post-Deployment
- [ ] Verify tenant isolation
- [ ] Verify feature flag system
- [ ] Verify usage tracking
- [ ] Verify billing integration
- [ ] Monitor system performance
