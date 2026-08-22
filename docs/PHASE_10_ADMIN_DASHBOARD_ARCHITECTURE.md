# PHASE 10: ADMIN SAAS DASHBOARD (GLOBAL) - DESIGN

## System Overview

The Admin SaaS Dashboard (Global) provides a centralized view of the entire SaaS platform for super admins. It displays revenue metrics, subscription status, churn rates, MRR/ARR, top performing stores, and system usage metrics across all tenants.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│              Global Admin Dashboard UI                     │
│              (Next.js + Charts)                           │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Revenue     │  │  Metrics    │
│  Analytics  │  │  Service    │
│  (MRR/ARR)   │  │  (Aggregation)│
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Tenant      │  │  Usage      │
│  Analytics  │  │  Tracking   │
│  (Per Org)   │  │  (System)   │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Database   │  │  Cache      │
│  (Prisma)   │  │  (Redis)    │
└─────────────┘  └─────────────┘
```

### Dashboard Flow
1. **Authentication**: Super admin authentication
2. **Data Aggregation**: Aggregate metrics across all tenants
3. **Real-time Updates**: WebSocket for real-time metrics
4. **Visualization**: Display charts and KPIs
5. **Drill-down**: Navigate to tenant-specific details

## 2. API Endpoints

### Global Revenue Metrics
```typescript
// GET /api/admin/platform/revenue
interface GetRevenueMetricsResponse {
  success: boolean;
  data: {
    totalRevenue: number;
    mrr: number;
    arr: number;
    revenueGrowth: number;
    revenueByPlan: Record<string, number>;
    revenueTrend: Array<{ date: string; revenue: number }>;
  };
}
```

### Subscription Metrics
```typescript
// GET /api/admin/platform/subscriptions
interface GetSubscriptionMetricsResponse {
  success: boolean;
  data: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    churnRate: number;
    subscriptionsByPlan: Record<string, number>;
    subscriptionTrend: Array<{ date: string; count: number }>;
  };
}
```

### Tenant Metrics
```typescript
// GET /api/admin/platform/tenants
interface GetTenantMetricsResponse {
  success: boolean;
  data: {
    totalTenants: number;
    activeTenants: number;
    trialTenants: number;
    topPerformingStores: Array<{
      organizationId: string;
      name: string;
      revenue: number;
      orders: number;
    }>;
  };
}
```

### System Usage Metrics
```typescript
// GET /api/admin/platform/usage
interface GetUsageMetricsResponse {
  success: boolean;
  data: {
    totalApiCalls: number;
    totalAiRequests: number;
    totalEmailsSent: number;
    totalOrdersProcessed: number;
    usageByMetric: Record<string, number>;
    usageTrend: Array<{ date: string; metrics: Record<string, number> }>;
  };
}
```

### Overview Dashboard
```typescript
// GET /api/admin/platform/overview
interface GetOverviewResponse {
  success: boolean;
  data: {
    revenue: {
      total: number;
      mrr: number;
      arr: number;
      growth: number;
    };
    subscriptions: {
      total: number;
      active: number;
      churnRate: number;
    };
    tenants: {
      total: number;
      active: number;
    };
    usage: {
      apiCalls: number;
      aiRequests: number;
      emails: number;
    };
  };
}
```

## 3. Data Aggregation Service

### Revenue Aggregation
```typescript
// src/lib/saas/revenue-aggregation.ts
export class RevenueAggregation {
  static async calculateMRR() {
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });
    
    let mrr = 0;
    
    for (const subscription of subscriptions) {
      const monthlyPrice = subscription.billingCycle === 'YEARLY'
        ? subscription.plan.yearlyPrice / 12
        : subscription.plan.monthlyPrice;
      
      mrr += monthlyPrice;
    }
    
    return mrr;
  }
  
  static async calculateARR() {
    const mrr = await this.calculateMRR();
    return mrr * 12;
  }
  
  static async calculateRevenueByPlan() {
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });
    
    const revenueByPlan = {};
    
    for (const subscription of subscriptions) {
      const planName = subscription.plan.name;
      const monthlyPrice = subscription.billingCycle === 'YEARLY'
        ? subscription.plan.yearlyPrice / 12
        : subscription.plan.monthlyPrice;
      
      if (!revenueByPlan[planName]) {
        revenueByPlan[planName] = 0;
      }
      
      revenueByPlan[planName] += monthlyPrice;
    }
    
    return revenueByPlan;
  }
}
```

### Subscription Aggregation
```typescript
// src/lib/saas/subscription-aggregation.ts
export class SubscriptionAggregation {
  static async calculateChurnRate() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const subscriptionsAtStart = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        createdAt: { lte: thirtyDaysAgo },
      },
    });
    
    const cancelledSubscriptions = await prisma.subscription.count({
      where: {
        status: 'CANCELLED',
        cancelledAt: { gte: thirtyDaysAgo },
      },
    });
    
    if (subscriptionsAtStart === 0) return 0;
    
    return (cancelledSubscriptions / subscriptionsAtStart) * 100;
  }
  
  static async getSubscriptionsByPlan() {
    const subscriptions = await prisma.subscription.groupBy({
      by: ['planId'],
      _count: true,
    });
    
    const result = {};
    
    for (const item of subscriptions) {
      const plan = await prisma.plan.findUnique({
        where: { id: item.planId },
      });
      
      result[plan.name] = item._count;
    }
    
    return result;
  }
}
```

### Tenant Analytics
```typescript
// src/lib/saas/tenant-analytics.ts
export class TenantAnalytics {
  static async getTopPerformingStores(limit = 10) {
    const organizations = await prisma.organization.findMany({
      include: {
        orders: { where: { status: 'COMPLETED' } },
      },
    });
    
    const storeMetrics = organizations.map(org => {
      const totalRevenue = org.orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = org.orders.length;
      
      return {
        organizationId: org.id,
        name: org.name,
        revenue: totalRevenue,
        orders: totalOrders,
      };
    });
    
    return storeMetrics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }
}
```

## 4. Frontend Dashboard

### Overview Dashboard
```typescript
// /admin/platform
- Total revenue (MRR/ARR)
- Active subscriptions
- Total tenants
- Churn rate
- Revenue growth
- Quick stats cards
- Revenue trend chart
- Subscription trend chart
- Top performing stores table
```

### Revenue Dashboard
```typescript
// /admin/platform/revenue
- Total revenue
- MRR breakdown
- ARR forecast
- Revenue by plan
- Revenue trend
- Growth rate
- Revenue comparison (MoM, YoY)
```

### Subscription Dashboard
```typescript
// /admin/platform/subscriptions
- Total subscriptions
- Active subscriptions
- Trial subscriptions
- Churn rate
- Subscriptions by plan
- Subscription trend
- Cancellation reasons
```

### Tenant Dashboard
```typescript
// /admin/platform/tenants
- Total tenants
- Active tenants
- Trial tenants
- Tenant list
- Top performing stores
- Tenant revenue ranking
- Tenant activity
```

### Usage Dashboard
```typescript
// /admin/platform/usage
- Total API calls
- Total AI requests
- Total emails sent
- Total orders processed
- Usage by metric
- Usage trend
- System health
```

## 5. Real-time Updates

### WebSocket Integration
```typescript
// src/lib/saas/websocket.ts
export class PlatformWebSocket {
  static async broadcastMetrics(metrics: any) {
    // Broadcast metrics to connected admin clients
    io.emit('platform-metrics', metrics);
  }
  
  static async subscribeToUpdates() {
    // Subscribe to real-time updates
  }
}
```

## 6. Performance Considerations

### Data Aggregation Performance
- Cached metrics with TTL
- Incremental updates
- Batch aggregation
- Read replicas for analytics

### Dashboard Performance
- Lazy loading of charts
- Debounced updates
- Optimistic UI updates
- Pagination for large datasets

## 7. Security Considerations

### Access Control
- Super admin only access
- IP whitelist
- Multi-factor authentication
- Audit logging

### Data Privacy
- Aggregated data only
- No PII in dashboard
- Encrypted data transmission
- Secure API endpoints

## 8. Deployment Strategy

### Pre-Deployment
- [ ] API endpoints deployed
- [ ] Aggregation services deployed
- [ ] WebSocket configured
- [ ] Cache configured
- [ ] Monitoring setup

### Deployment
- [ ] Deploy dashboard UI
- [ ] Deploy API endpoints
- [ ] Configure WebSocket
- [ ] Set up monitoring
- [ ] Test real-time updates

### Post-Deployment
- [ ] Verify metrics accuracy
- [ ] Verify real-time updates
- [ ] Verify performance
- [ ] Monitor system health
- [ ] Set up alerts
