# PHASE 10: BILLING ENFORCEMENT LAYER - DESIGN

## System Overview

The Billing Enforcement Layer ensures that subscription checks and feature access validation are enforced at the middleware level. It provides subscription status checks, feature access validation, API usage guards, and upgrade prompts system.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│              API Request                                   │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Subscription│  │  Feature    │
│  Check      │  │  Guard     │
│  (Middleware)│  │  (Middleware)│
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Usage       │  │  Upgrade    │
│  Guard      │  │  Prompt     │
│  (Guard)     │  │  (System)   │
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

### Enforcement Flow
1. **Request**: API request received
2. **Subscription Check**: Middleware checks subscription status
3. **Feature Guard**: Feature access validated
4. **Usage Guard**: Usage limits checked
5. **Enforcement**: Block or allow based on checks
6. **Upgrade Prompt**: Send upgrade prompt if needed

## 2. Middleware Components

### Subscription Check Middleware
```typescript
// src/lib/middleware/subscription-check.ts
export async function withSubscriptionCheck(handler: any) {
  return async (req: Request, ...args: any[]) => {
    const session = await getSession(req);
    
    if (!session?.organizationId) {
      throw new AuthError('No organization context');
    }
    
    const organization = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      include: { subscription: true },
    });
    
    if (!organization) {
      throw new AuthError('Organization not found');
    }
    
    // Check subscription status
    if (organization.status === 'CANCELLED') {
      throw new AuthError('Organization cancelled');
    }
    
    if (organization.status === 'SUSPENDED') {
      throw new AuthError('Organization suspended');
    }
    
    // Check subscription payment status
    if (organization.subscription?.status === 'PAST_DUE') {
      throw new AuthError('Subscription past due');
    }
    
    return handler(req, ...args);
  };
}
```

### Feature Access Guard
```typescript
// src/lib/guards/feature-access.ts
export function requireFeature(featureKey: string) {
  return async ({ session }: { session: any }) => {
    const { FeatureFlagService } = await import('@/lib/saas/feature-flag-service');
    
    const isEnabled = await FeatureFlagService.isEnabled(
      featureKey,
      session.organizationId
    );
    
    if (!isEnabled) {
      throw new AuthError(`Feature ${featureKey} not available`);
    }
    
    return true;
  };
}
```

### Usage Limit Guard
```typescript
// src/lib/guards/usage-limit.ts
export function checkUsageLimit(metric: string, quantity: number = 1) {
  return async ({ session }: { session: any }) => {
    const { LimitEnforcer } = await import('@/lib/saas/limit-enforcer');
    
    const check = await LimitEnforcer.checkLimit({
      organizationId: session.organizationId,
      metric,
      quantity,
    });
    
    if (!check.allowed) {
      throw new AuthError(`Usage limit exceeded for ${metric}`);
    }
    
    return true;
  };
}
```

## 3. Billing Enforcement Service

### Billing Enforcement Service
```typescript
// src/lib/saas/billing-enforcement.ts
export class BillingEnforcement {
  /**
   * Check if organization can access a feature
   */
  static async canAccessFeature(organizationId: string, featureKey: string) {
    const { FeatureFlagService } = await import('@/lib/saas/feature-flag-service');
    
    return await FeatureFlagService.isEnabled(featureKey, organizationId);
  }
  
  /**
   * Check if organization has active subscription
   */
  static async hasActiveSubscription(organizationId: string) {
    const { prisma } = await import('@/lib/prisma');
    
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });
    
    if (!organization) return false;
    
    if (organization.status !== 'ACTIVE') return false;
    
    if (organization.subscription?.status !== 'ACTIVE') return false;
    
    return true;
  }
  
  /**
   * Get upgrade prompt if needed
   */
  static async getUpgradePrompt(organizationId: string, featureKey: string) {
    const { prisma } = await import('@/lib/prisma');
    
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    
    const flag = await prisma.featureFlag.findUnique({
      where: { key: featureKey },
    });
    
    if (!flag || !flag.targetPlans) {
      return null;
    }
    
    const currentPlan = organization.plan?.name;
    const targetPlans = flag.targetPlans as string[];
    
    // Find the minimum plan that has this feature
    const planOrder = ['STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'];
    const currentPlanIndex = planOrder.indexOf(currentPlan);
    
    for (const targetPlan of targetPlans) {
      const targetPlanIndex = planOrder.indexOf(targetPlan);
      
      if (targetPlanIndex > currentPlanIndex) {
        return {
          requiredPlan: targetPlan,
          currentPlan,
          feature: flag.name,
        };
      }
    }
    
    return null;
  }
}
```

## 4. API Route Integration

### Example API Route with Enforcement
```typescript
// src/app/api/ai/insights/route.ts
import { withApi } from '@/lib/withApi';
import { requireFeature } from '@/lib/guards/feature-access';
import { checkUsageLimit } from '@/lib/guards/usage-limit';

export const POST = withApi(
  async ({ req, session }) => {
    // Process AI insights request
    const body = await req.json();
    
    return {
      success: true,
      insights: [],
    };
  },
  {
    requireAuth: true,
    guards: [
      requireFeature('ai_insights'),
      checkUsageLimit('AI_REQUESTS', 1),
    ],
  }
);
```

## 5. Upgrade Prompt System

### Upgrade Prompt Component
```typescript
// src/components/upgrade-prompt.tsx
'use client';

interface UpgradePromptProps {
  requiredPlan: string;
  currentPlan: string;
  feature: string;
}

export function UpgradePrompt({ requiredPlan, currentPlan, feature }: UpgradePromptProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="font-semibold text-yellow-800">Upgrade Required</h3>
      <p className="text-yellow-700 mt-1">
        The {feature} feature is available on the {requiredPlan} plan and above.
      </p>
      <button className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
        Upgrade to {requiredPlan}
      </button>
    </div>
  );
}
```

## 6. Error Handling

### Billing Error Types
```typescript
// src/lib/errors/billing-errors.ts
export class BillingError extends Error {
  constructor(
    message: string,
    public code: string,
    public upgradePrompt?: any
  ) {
    super(message);
    this.name = 'BillingError';
  }
}

export class SubscriptionExpiredError extends BillingError {
  constructor(upgradePrompt?: any) {
    super('Subscription expired', 'SUBSCRIPTION_EXPIRED', upgradePrompt);
  }
}

export class FeatureNotAvailableError extends BillingError {
  constructor(feature: string, upgradePrompt?: any) {
    super(`Feature ${feature} not available`, 'FEATURE_NOT_AVAILABLE', upgradePrompt);
  }
}

export class UsageLimitExceededError extends BillingError {
  constructor(metric: string, upgradePrompt?: any) {
    super(`Usage limit exceeded for ${metric}`, 'USAGE_LIMIT_EXCEEDED', upgradePrompt);
  }
}
```

## 7. Frontend Integration

### Billing Status Hook
```typescript
// src/hooks/use-billing-status.ts
export function useBillingStatus() {
  return useQuery({
    queryKey: ['billing-status'],
    queryFn: async () => {
      const response = await fetch('/api/saas/billing/status');
      return response.json();
    },
  });
}
```

### Billing Status Component
```typescript
// src/components/billing-status.tsx
'use client';

import { useBillingStatus } from '@/hooks/use-billing-status';

export function BillingStatus() {
  const { data, isLoading } = useBillingStatus();
  
  if (isLoading) return null;
  
  if (!data?.active) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">
          Your subscription is inactive. Please update your payment method.
        </p>
      </div>
    );
  }
  
  return null;
}
```

## 8. Performance Considerations

### Middleware Performance
- Cached subscription status
- Cached feature flags
- Cached usage limits
- Async validation

### Database Performance
- Indexed queries on subscription status
- Cached organization data
- Optimized feature flag queries
- Batch usage limit checks

## 9. Security Considerations

### Access Control
- Subscription status validated on every request
- Feature access checked before feature use
- Usage limits enforced at API level
- Upgrade prompts only for authenticated users

### Data Privacy
- No sensitive data in error messages
- Secure upgrade prompts
- Encrypted billing data
- Audit logging for enforcement actions

## 10. Deployment Strategy

### Pre-Deployment
- [ ] Middleware deployed
- [ ] Guards deployed
- [ ] Billing enforcement service deployed
- [ ] Error handling configured
- [ ] Upgrade prompt system deployed

### Deployment
- [ ] Deploy middleware
- [ ] Deploy guards
- [ ] Deploy billing service
- [ ] Configure error handling
- [ ] Test enforcement

### Post-Deployment
- [ ] Verify subscription checks
- [ ] Verify feature guards
- [ ] Verify usage guards
- [ ] Verify upgrade prompts
- [ ] Monitor enforcement metrics
