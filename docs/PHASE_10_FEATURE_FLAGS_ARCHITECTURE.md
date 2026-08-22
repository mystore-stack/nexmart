# PHASE 10: FEATURE FLAG SYSTEM - DESIGN

## System Overview

The Feature Flag System enables dynamic feature toggling, plan-based feature gating, and remote configuration. It allows features to be enabled/disabled per plan, per organization, or globally without code deployment.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│              Feature Flag Dashboard UI                     │
│              (Next.js + Toggle Interface)                  │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Feature     │  │  Plan       │
│  Flag       │  │  Service   │
│  Manager    │  │  (Gating)   │
│  (Next.js)   │  │  (Logic)    │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Cache       │  │  Database   │
│  (Redis)     │  │  (Prisma)   │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  API        │  │  Middleware │
│  Endpoints  │  │  (Guards)   │
└─────────────┘  └─────────────┘
```

### Feature Flag Flow
1. **Flag Definition**: Admin creates feature flag with targeting rules
2. **Cache Update**: Flag cached in Redis with TTL
3. **API Check**: Middleware checks flag before feature access
4. **Plan Validation**: Plan eligibility verified
5. **Organization Check**: Organization-specific targeting applied
6. **Result**: Feature enabled/disabled based on rules

## 2. Prisma Schema Updates

### Feature Flag Model (Already Added)
```prisma
model FeatureFlag {
  id             String   @id @default(uuid()) @db.Uuid
  key            String   @unique
  name           String
  description    String?
  
  // Configuration
  enabled        Boolean  @default(false)
  rolloutPercentage Float @default(0)
  
  // Targeting
  targetPlans    Json?
  targetOrganizations Json?
  
  // Metadata
  category       String?
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([enabled])
  @@index([category])
}
```

## 3. API Endpoints

### Feature Flag Management
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
  rolloutPercentage?: number;
  targetPlans?: string[];
  targetOrganizations?: string[];
  category?: string;
}

interface CreateFeatureFlagResponse {
  success: boolean;
  flag: FeatureFlag;
}

// PATCH /api/saas/feature-flags/[id]
interface UpdateFeatureFlagRequest {
  enabled?: boolean;
  rolloutPercentage?: number;
  targetPlans?: string[];
  targetOrganizations?: string[];
}

interface UpdateFeatureFlagResponse {
  success: boolean;
  flag: FeatureFlag;
}

// DELETE /api/saas/feature-flags/[id]
interface DeleteFeatureFlagResponse {
  success: boolean;
}
```

### Feature Flag Check
```typescript
// GET /api/saas/feature-flags/check?key=ai-insights
interface CheckFeatureFlagResponse {
  success: boolean;
  enabled: boolean;
  flag: FeatureFlag;
}
```

## 4. Feature Flag Service

### Feature Flag Service
```typescript
// src/lib/saas/feature-flag-service.ts
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export class FeatureFlagService {
  /**
   * Check if a feature is enabled for an organization
   */
  static async isEnabled(
    featureKey: string,
    organizationId: string
  ): Promise<boolean> {
    // Try cache first
    const cacheKey = `feature_flag:${featureKey}:${organizationId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached !== null) {
      return cached === 'true';
    }
    
    // Fetch from database
    const flag = await prisma.featureFlag.findUnique({
      where: { key: featureKey },
    });
    
    if (!flag || !flag.enabled) {
      await redis.set(cacheKey, 'false', 60); // Cache for 60 seconds
      return false;
    }
    
    // Check plan eligibility
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    
    if (flag.targetPlans) {
      const targetPlans = flag.targetPlans as string[];
      const planName = organization?.plan?.name;
      
      if (!targetPlans.includes(planName)) {
        await redis.set(cacheKey, 'false', 60);
        return false;
      }
    }
    
    // Check organization-specific targeting
    if (flag.targetOrganizations) {
      const targetOrgs = flag.targetOrganizations as string[];
      
      if (!targetOrgs.includes(organizationId)) {
        await redis.set(cacheKey, 'false', 60);
        return false;
      }
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashString(`${featureKey}:${organizationId}`);
      const percentage = (hash % 100) + 1;
      
      if (percentage > flag.rolloutPercentage) {
        await redis.set(cacheKey, 'false', 60);
        return false;
      }
    }
    
    await redis.set(cacheKey, 'true', 60);
    return true;
  }
  
  /**
   * Get all feature flags for an organization
   */
  static async getOrganizationFlags(organizationId: string) {
    const flags = await prisma.featureFlag.findMany({
      where: { enabled: true },
    });
    
    const result = {};
    
    for (const flag of flags) {
      result[flag.key] = await this.isEnabled(flag.key, organizationId);
    }
    
    return result;
  }
  
  /**
   * Invalidate cache for a feature flag
   */
  static async invalidateCache(featureKey: string, organizationId?: string) {
    if (organizationId) {
      const cacheKey = `feature_flag:${featureKey}:${organizationId}`;
      await redis.del(cacheKey);
    } else {
      // Invalidate all caches for this feature
      const pattern = `feature_flag:${featureKey}:*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
  
  /**
   * Hash string to number for rollout percentage
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
```

## 5. Middleware & Guards

### Feature Flag Guard
```typescript
// src/lib/guards/feature-flag.ts
import { FeatureFlagService } from '@/lib/saas/feature-flag-service';

export function requireFeature(featureKey: string) {
  return async ({ session }: { session: any }) => {
    const isEnabled = await FeatureFlagService.isEnabled(
      featureKey,
      session.organizationId
    );
    
    if (!isEnabled) {
      throw new Error(`Feature ${featureKey} is not available`);
    }
    
    return true;
  };
}
```

### Feature Flag Middleware
```typescript
// src/lib/middleware/feature-flag.ts
import { NextRequest, NextResponse } from 'next/server';
import { FeatureFlagService } from '@/lib/saas/feature-flag-service';

export async function withFeatureFlag(
  featureKey: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // Get organization from session
    const session = await getSession(req);
    
    if (!session?.organizationId) {
      return NextResponse.json(
        { error: 'No organization context' },
        { status: 401 }
      );
    }
    
    const isEnabled = await FeatureFlagService.isEnabled(
      featureKey,
      session.organizationId
    );
    
    if (!isEnabled) {
      return NextResponse.json(
        { error: 'Feature not available' },
        { status: 403 }
      );
    }
    
    return handler(req);
  };
}
```

## 6. Feature Flag Configuration

### Default Feature Flags
```typescript
// src/lib/saas/default-flags.ts
export const DEFAULT_FEATURE_FLAGS = [
  {
    key: 'ai_insights',
    name: 'AI Insights',
    description: 'AI-powered product insights and recommendations',
    enabled: false,
    targetPlans: ['GROWTH', 'PRO', 'ENTERPRISE'],
    category: 'AI',
  },
  {
    key: 'cro_system',
    name: 'CRO System',
    description: 'Conversion Rate Optimization with A/B testing',
    enabled: false,
    targetPlans: ['GROWTH', 'PRO', 'ENTERPRISE'],
    category: 'CRO',
  },
  {
    key: 'advanced_bi',
    name: 'Advanced BI',
    description: 'Advanced Business Intelligence dashboards',
    enabled: false,
    targetPlans: ['PRO', 'ENTERPRISE'],
    category: 'BI',
  },
  {
    key: 'personalization',
    name: 'Personalization Engine',
    description: 'Product personalization and recommendations',
    enabled: false,
    targetPlans: ['GROWTH', 'PRO', 'ENTERPRISE'],
    category: 'Personalization',
  },
  {
    key: 'custom_domain',
    name: 'Custom Domain',
    description: 'Custom domain for storefront',
    enabled: false,
    targetPlans: ['ENTERPRISE'],
    category: 'Branding',
  },
  {
    key: 'api_access',
    name: 'API Access',
    description: 'API access for integrations',
    enabled: false,
    targetPlans: ['ENTERPRISE'],
    category: 'API',
  },
];
```

## 7. Frontend Integration

### Feature Flag Hook
```typescript
// src/hooks/use-feature-flag.ts
import { useQuery } from '@tanstack/react-query';

export function useFeatureFlag(featureKey: string) {
  return useQuery({
    queryKey: ['feature-flag', featureKey],
    queryFn: async () => {
      const response = await fetch(`/api/saas/feature-flags/check?key=${featureKey}`);
      return response.json();
    },
  });
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const response = await fetch('/api/saas/feature-flags');
      return response.json();
    },
  });
}
```

### Feature Flag Component
```typescript
// src/components/feature-flag-wrapper.tsx
'use client';

import { useFeatureFlag } from '@/hooks/use-feature-flag';

interface FeatureFlagWrapperProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlagWrapper({
  featureKey,
  children,
  fallback = null,
}: FeatureFlagWrapperProps) {
  const { data, isLoading } = useFeatureFlag(featureKey);
  
  if (isLoading) {
    return null;
  }
  
  if (data?.enabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
```

## 8. Frontend Dashboard

### Feature Flag Dashboard
```typescript
// /admin/saas/feature-flags
- Feature flag list
- Create new flag
- Edit flag settings
- Enable/disable flags
- Targeting configuration
- Rollout percentage
- Flag usage analytics
```

## 9. Performance Considerations

### Caching Strategy
- Redis cache with 60-second TTL
- Bulk cache invalidation on flag updates
- Cache warming for frequently accessed flags
- CDN caching for flag configurations

### Query Optimization
- Indexed queries on enabled and category
- Batch flag checks for multiple features
- Lazy loading of flag details
- Optimistic UI updates

## 10. Security Considerations

### Access Control
- Admin-only flag management
- Organization-scoped flag checks
- Audit logging for flag changes
- Rate limiting on flag checks

### Data Privacy
- No sensitive data in flags
- Encrypted flag values if needed
- Secure flag distribution
- Audit trail for flag changes

## 11. Deployment Strategy

### Pre-Deployment
- [ ] Feature flag model added
- [ ] Default flags seeded
- [ ] Redis cache configured
- [ ] Feature flag service deployed
- [ ] Middleware and guards deployed

### Deployment
- [ ] Deploy API endpoints
- [ ] Deploy feature flag service
- [ ] Seed default flags
- [ ] Configure Redis cache
- [ ] Test flag toggling

### Post-Deployment
- [ ] Verify flag checks
- [ ] Verify cache invalidation
- [ ] Verify plan-based gating
- [ ] Verify organization targeting
- [ ] Monitor flag usage
