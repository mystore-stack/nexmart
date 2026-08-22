# PHASE 9: PERFORMANCE & SCALE LAYER - ARCHITECTURE DESIGN

## System Overview

The Performance & Scale Layer optimizes the system for high concurrency (10k-100k concurrent users), implements queue scaling strategies, optimizes Redis and database queries, and establishes read replica strategies for horizontal scaling.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer                          │
│              (AWS ALB / Nginx)                          │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  App Server 1│  │ App Server 2│
│  (Node.js)   │  │  (Node.js)  │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Redis       │  │  Redis      │
│  (Primary)   │  │  (Replica) │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│ PostgreSQL   │  │ PostgreSQL  │
│  (Primary)   │  │ (Replica)  │
└──────────────┘  └────────────┘
```

### Scaling Strategy
- **Horizontal Scaling**: Multiple app servers behind load balancer
- **Redis Clustering**: Redis cluster for high availability
- **Read Replicas**: PostgreSQL read replicas for read-heavy operations
- **Queue Clustering**: BullMQ clustering for background jobs
- **Connection Pooling**: Optimized database connection pools

## 2. Database Optimization

### Connection Pooling
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pool configuration
  connection_limit = 20
  pool_timeout = 10
}
```

### Query Optimization
- **Index Strategy**: Composite indexes for frequently queried columns
- **Query Optimization**: Use select/include to limit fields
- **Batch Operations**: Use bulk operations for inserts/updates
- **N+1 Prevention**: Use include/select for relations

### Read Replica Configuration
```typescript
// src/lib/prisma-replica.ts
import { PrismaClient } from '@prisma/client';

export const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL,
    },
  },
});

export const prismaWrite = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

### Database Indexes
```prisma
// Critical indexes for performance
@@index([organizationId, status])
@@index([userId, createdAt])
@@index([productId, published])
@@index([eventType, occurredAt])
```

## 3. Redis Optimization

### Redis Clustering
```typescript
// src/lib/redis-cluster.ts
import { Cluster } from 'ioredis';

export const redisCluster = new Cluster([
  {
    host: process.env.REDIS_HOST_1,
    port: 6379,
  },
  {
    host: process.env.REDIS_HOST_2,
    port: 6379,
  },
  {
    host: process.env.REDIS_HOST_3,
    port: 6379,
  },
], {
  scaleReads: 'slave',
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
  },
});
```

### Cache Strategy
- **Multi-level Caching**: Redis + in-memory cache
- **Cache Warming**: Pre-warm cache for frequently accessed data
- **Cache Invalidation**: Strategic cache invalidation
- **TTL Strategy**: Appropriate TTL for different data types

### Cache Keys Strategy
```typescript
// Consistent cache key naming
const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  PRODUCT: (productId: string) => `product:${productId}`,
  CATEGORY_PRODUCTS: (categoryId: string) => `category:${categoryId}:products`,
  ANALYTICS: (orgId: string, date: string) => `analytics:${orgId}:${date}`,
};
```

## 4. Queue Scaling

### BullMQ Clustering
```typescript
// src/lib/queues/clustered-queue.ts
import { Queue, Worker } from 'bullmq';
import { redisCluster } from '@/lib/redis-cluster';

export const eventQueue = new Queue('events', {
  connection: redisCluster,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Multiple workers for horizontal scaling
export const eventWorkers = Array.from({ length: 5 }, (_, i) =>
  new Worker(
    'events',
    async (job) => {
      await processEvent(job.data);
    },
    {
      connection: redisCluster,
      concurrency: 10,
    }
  )
);
```

### Queue Prioritization
- **High Priority**: Purchase, checkout events
- **Medium Priority**: Add to cart, product views
- **Low Priority**: Analytics aggregation, cleanup jobs

### Queue Monitoring
```typescript
// Queue health check
async function checkQueueHealth() {
  const waiting = await eventQueue.getWaiting();
  const active = await eventQueue.getActive();
  const failed = await eventQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    failed: failed.length,
  };
}
```

## 5. API Optimization

### Response Compression
```javascript
// next.config.js
module.exports = {
  compress: true,
  swcMinify: true,
};
```

### API Response Caching
```typescript
// src/lib/api-cache.ts
export const withCache = (ttl: number) => {
  return async (req: NextRequest, handler: Function) => {
    const cacheKey = generateCacheKey(req);
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    const response = await handler(req);
    await redis.setex(cacheKey, ttl, JSON.stringify(response));

    return NextResponse.json(response, {
      headers: { 'X-Cache': 'MISS' },
    });
  };
};
```

### Rate Limiting
```typescript
// Enhanced rate limiting with Redis
export async function rateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  };
}
```

## 6. Frontend Optimization

### Code Splitting
```typescript
// Dynamic imports for code splitting
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <DashboardSkeleton />,
});

const Analytics = dynamic(() => import('@/components/Analytics'), {
  loading: () => <AnalyticsSkeleton />,
});
```

### Image Optimization
```typescript
// Next.js Image component
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="Product"
  width={500}
  height={500}
  loading="lazy"
  placeholder="blur"
/>
```

### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    };
    return config;
  },
};
```

## 7. Monitoring & Observability

### Performance Monitoring
```typescript
// src/lib/monitoring/performance.ts
export class PerformanceMonitor {
  static trackApiCall(endpoint: string, duration: number) {
    // Send to monitoring service
    console.log(`[Performance] ${endpoint}: ${duration}ms`);
  }

  static trackDatabaseQuery(query: string, duration: number) {
    console.log(`[DB Query] ${query}: ${duration}ms`);
  }

  static trackCacheHit(key: string, hit: boolean) {
    console.log(`[Cache] ${key}: ${hit ? 'HIT' : 'MISS'}`);
  }
}
```

### Health Checks
```typescript
// src/app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      queue: await checkQueue(),
    },
  };

  return NextResponse.json(health);
}
```

### Alerting
- **Database Connection Pool**: Alert when pool usage > 80%
- **Queue Size**: Alert when queue size > 1000
- **Cache Hit Rate**: Alert when cache hit rate < 70%
- **Response Time**: Alert when p95 response time > 1000ms

## 8. Auto-scaling Strategy

### Horizontal Pod Autoscaling (Kubernetes)
```yaml
# deployment.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nexmart-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nexmart-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Connection Pool Scaling
```typescript
// Dynamic connection pool sizing
const poolSize = Math.min(
  Math.max(Math.floor(process.env.WEB_CONCURRENCY || 1) * 2, 5),
  20
);
```

## 9. Deployment Checklist

### Pre-Deployment
- [ ] Database indexes created
- [ ] Redis cluster configured
- [ ] Read replicas configured
- [ ] Connection pooling configured
- [ ] Queue clustering configured
- [ ] Monitoring configured
- [ ] Alerting configured

### Deployment
- [ ] Deploy with zero downtime
- [ ] Run database migrations
- [ ] Warm up cache
- [ ] Verify health checks

### Post-Deployment
- [ ] Monitor performance metrics
- [ ] Monitor error rates
- [ ] Monitor queue sizes
- [ ] Monitor cache hit rates
- [ ] Verify auto-scaling

## 10. Performance Targets

### API Performance
- **p50 Response Time**: < 100ms
- **p95 Response Time**: < 500ms
- **p99 Response Time**: < 1000ms
- **Error Rate**: < 0.1%

### Database Performance
- **Query p50**: < 10ms
- **Query p95**: < 50ms
- **Connection Pool Usage**: < 80%
- **Replica Lag**: < 100ms

### Cache Performance
- **Cache Hit Rate**: > 80%
- **Cache Response Time**: < 5ms
- **Redis Memory Usage**: < 80%

### Queue Performance
- **Queue Processing Time**: < 1s
- **Queue Size**: < 1000
- **Failed Jobs**: < 1%
