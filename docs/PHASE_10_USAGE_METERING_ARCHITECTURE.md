# PHASE 10: USAGE METERING SYSTEM - DESIGN

## System Overview

The Usage Metering System tracks and enforces usage limits per tenant. It monitors API calls, AI requests, emails sent, orders processed, and storage usage. The system enforces hard and soft limits based on the tenant's plan.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│              Usage Dashboard UI                            │
│              (Next.js + Charts)                           │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Usage       │  │  Limit      │
│  Tracker    │  │  Enforcer   │
│  (Service)   │  │  (Guard)    │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Database   │  │  Cache      │
│  (Prisma)   │  │  (Redis)    │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Background │  │  Alert      │
│  Job        │  │  System    │
│  (Aggregation)│  (Notifications)│
└─────────────┘  └─────────────┘
```

### Usage Metering Flow
1. **Usage Event**: API call, AI request, email sent, order processed
2. **Tracking**: Usage recorded in database
3. **Aggregation**: Background job aggregates usage by period
4. **Limit Check**: Enforcer checks against plan limits
5. **Enforcement**: Hard limits block, soft limits warn
6. **Alerting**: Notifications sent when limits approached

## 2. Prisma Schema Updates

### Usage Record Model (Already Added)
```prisma
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
```

## 3. Usage Tracking Service

### Usage Tracker
```typescript
// src/lib/saas/usage-tracker.ts
export class UsageTracker {
  /**
   * Track usage for a metric
   */
  static async trackUsage(params: {
    organizationId: string;
    metric: UsageMetric;
    quantity: number;
  }) {
    const { prisma } = await import('@/lib/prisma');
    
    // Get current period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Upsert usage record
    const record = await prisma.usageRecord.upsert({
      where: {
        organizationId_metric_periodStart: {
          organizationId: params.organizationId,
          metric: params.metric,
          periodStart,
        },
      },
      create: {
        organizationId: params.organizationId,
        metric: params.metric,
        quantity: params.quantity,
        periodStart,
        periodEnd,
      },
      update: {
        quantity: {
          increment: params.quantity,
        },
      },
    });
    
    return record;
  }
  
  /**
   * Get current usage for a metric
   */
  static async getCurrentUsage(organizationId: string, metric: UsageMetric) {
    const { prisma } = await import('@/lib/prisma');
    
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const record = await prisma.usageRecord.findUnique({
      where: {
        organizationId_metric_periodStart: {
          organizationId,
          metric,
          periodStart,
        },
      },
    });
    
    return record?.quantity || 0;
  }
  
  /**
   * Get all usage for an organization
   */
  static async getOrganizationUsage(organizationId: string) {
    const { prisma } = await import('@/lib/prisma');
    
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const records = await prisma.usageRecord.findMany({
      where: {
        organizationId,
        periodStart,
      },
    });
    
    const usage: Record<string, number> = {};
    
    for (const record of records) {
      usage[record.metric] = record.quantity;
    }
    
    return usage;
  }
}
```

## 4. Limit Enforcement

### Limit Enforcer
```typescript
// src/lib/saas/limit-enforcer.ts
export class LimitEnforcer {
  /**
   * Check if usage is within limits
   */
  static async checkLimit(params: {
    organizationId: string;
    metric: UsageMetric;
    quantity: number;
  }) {
    const { prisma } = await import('@/lib/prisma');
    
    // Get organization with plan
    const organization = await prisma.organization.findUnique({
      where: { id: params.organizationId },
      include: { plan: true },
    });
    
    if (!organization?.plan) {
      return { allowed: true, reason: 'No plan' };
    }
    
    // Get plan limits
    const limits = organization.plan.limits as any;
    const limit = limits[params.metric];
    
    // Unlimited (-1)
    if (limit === -1) {
      return { allowed: true, reason: 'Unlimited' };
    }
    
    // Get current usage
    const currentUsage = await UsageTracker.getCurrentUsage(
      params.organizationId,
      params.metric
    );
    
    const newUsage = currentUsage + params.quantity;
    
    // Check hard limit
    if (newUsage > limit) {
      return {
        allowed: false,
        reason: 'Limit exceeded',
        current: currentUsage,
        limit,
      };
    }
    
    // Check soft limit (80% threshold)
    const softLimit = limit * 0.8;
    if (newUsage > softLimit) {
      return {
        allowed: true,
        warning: true,
        reason: 'Approaching limit',
        current: currentUsage,
        limit,
        percentage: (newUsage / limit) * 100,
      };
    }
    
    return { allowed: true, current: currentUsage, limit };
  }
  
  /**
   * Get usage statistics
   */
  static async getUsageStats(organizationId: string) {
    const { prisma } = await import('@/lib/prisma');
    
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    
    const limits = organization?.plan?.limits as any || {};
    const usage = await UsageTracker.getOrganizationUsage(organizationId);
    
    const stats: Record<string, { used: number; limit: number; percentage: number }> = {};
    
    for (const [metric, limit] of Object.entries(limits)) {
      const used = usage[metric] || 0;
      const percentage = limit === -1 ? 0 : (used / limit) * 100;
      
      stats[metric] = { used, limit, percentage };
    }
    
    return stats;
  }
}
```

## 5. API Endpoints

### Usage Tracking
```typescript
// POST /api/saas/usage/track
interface TrackUsageRequest {
  metric: UsageMetric;
  quantity: number;
}

interface TrackUsageResponse {
  success: boolean;
  record: UsageRecord;
  limitCheck: {
    allowed: boolean;
    warning?: boolean;
    reason?: string;
  };
}
```

### Usage Statistics
```typescript
// GET /api/saas/usage
interface GetUsageResponse {
  success: boolean;
  usage: Record<string, { used: number; limit: number; percentage: number }>;
}
```

### Usage History
```typescript
// GET /api/saas/usage/history
interface GetUsageHistoryRequest {
  metric?: UsageMetric;
  months?: number;
}

interface GetUsageHistoryResponse {
  success: boolean;
  history: Array<{
    period: string;
    metric: string;
    quantity: number;
  }>;
}
```

## 6. Background Jobs

### Usage Aggregation Job
```typescript
// src/lib/jobs/usage-aggregation.job.ts
export const usageAggregationJob = new CronJob(
  '0 0 * * *', // Daily at midnight
  async () => {
    await aggregateDailyUsage();
  },
  null,
  true,
  'UTC'
);

async function aggregateDailyUsage() {
  const { prisma } = await import('@/lib/prisma');
  
  const organizations = await prisma.organization.findMany({
    where: { status: 'ACTIVE' },
  });
  
  for (const organization of organizations) {
    // Aggregate usage for each metric
    const metrics = ['API_CALLS', 'AI_REQUESTS', 'EMAILS_SENT', 'ORDERS_PROCESSED'];
    
    for (const metric of metrics) {
      // Get current period usage
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const record = await prisma.usageRecord.findUnique({
        where: {
          organizationId_metric_periodStart: {
            organizationId: organization.id,
            metric,
            periodStart,
          },
        },
      });
      
      if (!record) {
        // Create new record for the period
        await prisma.usageRecord.create({
          data: {
            organizationId: organization.id,
            metric,
            quantity: 0,
            periodStart,
            periodEnd,
          },
        });
      }
    }
  }
}
```

## 7. Middleware Integration

### Usage Middleware
```typescript
// src/lib/middleware/usage-tracking.ts
export async function withUsageTracking(metric: UsageMetric, handler: any) {
  return async (req: Request, ...args: any[]) => {
    const session = await getSession(req);
    
    if (session?.organizationId) {
      // Track usage
      await UsageTracker.trackUsage({
        organizationId: session.organizationId,
        metric,
        quantity: 1,
      });
    }
    
    return handler(req, ...args);
  };
}
```

### Usage Guard
```typescript
// src/lib/guards/usage-limit.ts
export function checkUsageLimit(metric: UsageMetric, quantity: number = 1) {
  return async ({ session }: { session: any }) => {
    const check = await LimitEnforcer.checkLimit({
      organizationId: session.organizationId,
      metric,
      quantity,
    });
    
    if (!check.allowed) {
      throw new Error(`Usage limit exceeded for ${metric}`);
    }
    
    return true;
  };
}
```

## 8. Frontend Dashboard

### Usage Dashboard
```typescript
// /admin/usage
- Current usage metrics
- Usage limits
- Usage percentage
- Usage trends
- Upgrade prompts
- Usage alerts
```

## 9. Alerting System

### Usage Alerts
```typescript
// src/lib/saas/usage-alerts.ts
export class UsageAlerts {
  static async checkAndSendAlerts(organizationId: string) {
    const stats = await LimitEnforcer.getUsageStats(organizationId);
    
    for (const [metric, data] of Object.entries(stats)) {
      // Send alert at 80%
      if (data.percentage >= 80 && data.percentage < 90) {
        await sendUsageWarning(organizationId, metric, data);
      }
      
      // Send alert at 90%
      if (data.percentage >= 90 && data.percentage < 100) {
        await sendUsageCritical(organizationId, metric, data);
      }
      
      // Send alert at 100%
      if (data.percentage >= 100) {
        await sendUsageExceeded(organizationId, metric, data);
      }
    }
  }
}
```

## 10. Performance Considerations

### Tracking Performance
- Batch usage updates
- Redis caching for current usage
- Async tracking (fire and forget)
- Optimistic updates

### Query Performance
- Indexed queries on organizationId, metric, periodStart
- Aggregated queries for history
- Pagination for large datasets
- Cache usage statistics

## 11. Security Considerations

### Data Integrity
- Atomic updates to prevent race conditions
- Audit logging for usage changes
- Tamper-proof usage records
- Secure API endpoints

### Access Control
- Organization-scoped usage data
- Admin-only access to global usage
- Rate limiting on tracking endpoints
- IP whitelist for tracking

## 12. Deployment Strategy

### Pre-Deployment
- [ ] Usage record model added
- [ ] Usage tracker deployed
- [ ] Limit enforcer deployed
- [ ] Background job scheduled
- [ ] Alert system configured

### Deployment
- [ ] Deploy usage tracker
- [ ] Deploy limit enforcer
- [ ] Deploy background job
- [ ] Deploy API endpoints
- [ ] Configure alerts

### Post-Deployment
- [ ] Verify usage tracking
- [ ] Verify limit enforcement
- [ ] Verify alerts
- [ ] Monitor usage metrics
- [ ] Tune aggregation frequency
