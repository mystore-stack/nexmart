# PHASE 9: EVENT TRACKING SYSTEM - ARCHITECTURE DESIGN

## System Overview

The Event Tracking System is the foundational layer for all growth and scaling initiatives. It captures user behavior events in real-time, stores them efficiently, and provides analytics capabilities for downstream systems (CRO, Personalization, Retention, BI).

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────┐
│   Client    │
│ (Browser/   │
│    Mobile)  │
└──────┬──────┘
       │
       │ 1. Track Event
       ▼
┌─────────────────┐
│  API Gateway    │
│  /api/events   │
└──────┬──────────┘
       │
       │ 2. Validate & Enqueue
       ▼
┌─────────────────┐
│  Event Queue    │
│  (BullMQ)       │
└──────┬──────────┘
       │
       │ 3. Process Async
       ▼
┌─────────────────┐
│ Event Processor│
│  Background Job│
└──────┬──────────┘
       │
       │ 4. Store
       ▼
┌─────────────────┐
│   Database     │
│ analytics_events│
└──────┬──────────┘
       │
       │ 5. Aggregate
       ▼
┌─────────────────┐
│  Analytics     │
│  Aggregation   │
│  (Cron Job)    │
└─────────────────┘
```

### Event Flow
1. **Client** sends event to API endpoint
2. **API Gateway** validates event, enqueues to BullMQ
3. **Event Processor** (background job) processes and stores event
4. **Database** stores raw events
5. **Aggregation Job** aggregates events for analytics

## 2. Prisma Schema Additions

### New Enums
```prisma
enum EventType {
  PRODUCT_VIEW
  ADD_TO_CART
  REMOVE_FROM_CART
  CHECKOUT_STARTED
  CHECKOUT_COMPLETED
  CHECKOUT_ABANDONED
  PURCHASE
  SEARCH_QUERY
  FILTER_APPLIED
  CATEGORY_VIEW
  BRAND_VIEW
  PROMOTION_CLICKED
  RECOMMENDATION_CLICKED
  WISHLIST_ADD
  WISHLIST_REMOVE
  REVIEW_SUBMITTED
  LOGIN
  LOGOUT
  SIGNUP
  PAGE_VIEW
  SCROLL_DEPTH
  TIME_ON_PAGE
  ERROR
}

enum EventSource {
  WEB
  MOBILE_WEB
  MOBILE_APP
  API
  WEBHOOK
  EMAIL
}
```

### New Models
```prisma
model AnalyticsEvent {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  userId         String?  @db.Uuid
  sessionId      String?  @db.Uuid
  eventType      EventType
  eventSource    EventSource
  
  // Event Properties
  properties     Json     // Flexible event-specific data
  productId      String?  @db.Uuid
  categoryId     String?  @db.Uuid
  orderId        String?  @db.Uuid
  searchQuery    String?
  
  // Context
  url            String?
  referrer       String?
  userAgent      String?
  ipAddress      String?
  deviceType     String?
  browser        String?
  os             String?
  
  // Timestamps
  occurredAt     DateTime @default(now())
  processedAt    DateTime?
  
  // Relations
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  product        Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  category       Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  order          Order?   @relation(fields: [orderId], references: [id], onDelete: SetNull)
  
  @@index([organizationId, occurredAt])
  @@index([userId, occurredAt])
  @@index([sessionId, occurredAt])
  @@index([eventType, occurredAt])
  @@index([productId, occurredAt])
  @@index([organizationId, eventType, occurredAt])
  @@index([occurredAt])
}

model Session {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  userId         String?  @db.Uuid
  sessionId      String   @unique
  startedAt      DateTime @default(now())
  endedAt        DateTime?
  
  // Session Metrics
  pageViews      Int      @default(0)
  duration       Int?     // in seconds
  bounce         Boolean  @default(true)
  conversions    Int      @default(0)
  
  // Device Info
  deviceType     String?
  browser        String?
  os             String?
  ipAddress      String?
  
  // Relations
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  events         AnalyticsEvent[]
  
  @@index([organizationId, startedAt])
  @@index([userId, startedAt])
  @@index([sessionId])
}

model FunnelStep {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  funnelName     String
  stepName       String
  stepOrder      Int
  eventType      EventType
  
  // Step Configuration
  required       Boolean  @default(true)
  timeWindow     Int?     // in seconds
  
  @@unique([organizationId, funnelName, stepName])
  @@index([organizationId, funnelName])
}

model FunnelAnalysis {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  funnelName     String
  startDate      DateTime
  endDate        DateTime
  
  // Funnel Metrics
  totalUsers     Int
  step1Users     Int
  step2Users     Int
  step3Users     Int
  step4Users     Int
  step5Users     Int
  
  // Conversion Rates
  step1Rate      Float
  step2Rate      Float
  step3Rate      Float
  step4Rate      Float
  overallRate    Float
  
  @@index([organizationId, funnelName, startDate])
}
```

### Model Updates
```prisma
model User {
  // ... existing fields
  sessions       Session[]
  analyticsEvents AnalyticsEvent[]
}

model Product {
  // ... existing fields
  analyticsEvents AnalyticsEvent[]
}

model Category {
  // ... existing fields
  analyticsEvents AnalyticsEvent[]
}

model Order {
  // ... existing fields
  analyticsEvents AnalyticsEvent[]
}
```

## 3. API Endpoints

### Track Event
```typescript
// POST /api/events/track
interface TrackEventRequest {
  eventType: EventType;
  properties?: Record<string, any>;
  productId?: string;
  categoryId?: string;
  orderId?: string;
  searchQuery?: string;
  url?: string;
  referrer?: string;
}

interface TrackEventResponse {
  success: boolean;
  eventId: string;
}
```

### Batch Track Events
```typescript
// POST /api/events/batch
interface BatchTrackRequest {
  events: TrackEventRequest[];
}

interface BatchTrackResponse {
  success: boolean;
  processed: number;
  failed: number;
}
```

### Get Events
```typescript
// GET /api/events
interface GetEventsRequest {
  eventType?: EventType;
  userId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface GetEventsResponse {
  success: boolean;
  events: AnalyticsEvent[];
  total: number;
}
```

### Get Funnel Analysis
```typescript
// GET /api/events/funnels/:funnelName
interface FunnelAnalysisResponse {
  success: boolean;
  funnelName: string;
  startDate: string;
  endDate: string;
  metrics: {
    totalUsers: number;
    steps: Array<{
      stepName: string;
      users: number;
      rate: number;
    }>;
    overallRate: number;
  };
}
```

### Get Session Analytics
```typescript
// GET /api/events/sessions/:sessionId
interface SessionAnalyticsResponse {
  success: boolean;
  session: {
    sessionId: string;
    userId: string | null;
    startedAt: string;
    endedAt: string | null;
    pageViews: number;
    duration: number | null;
    bounce: boolean;
    conversions: number;
    events: AnalyticsEvent[];
  };
}
```

## 4. Background Jobs / Queues

### Event Processing Queue
```typescript
// src/lib/queues/event-processing.queue.ts
import { Queue, Worker } from 'bullmq';
import { redis } from '@/lib/redis';

export const eventQueue = new Queue('events', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Event Processor Worker
export const eventWorker = new Worker(
  'events',
  async (job) => {
    const { eventData } = job.data;
    await processEvent(eventData);
  },
  {
    connection: redis,
    concurrency: 10,
  }
);
```

### Event Aggregation Job (Cron)
```typescript
// src/lib/jobs/event-aggregation.job.ts
import { CronJob } from 'cron';

export const eventAggregationJob = new CronJob(
  '0 * * * *', // Every hour
  async () => {
    await aggregateHourlyEvents();
  },
  null,
  true,
  'UTC'
);

async function aggregateHourlyEvents() {
  // Aggregate events by hour for faster analytics queries
  const startTime = new Date(Date.now() - 60 * 60 * 1000);
  const endTime = new Date();
  
  await aggregateEventsByType(startTime, endTime);
  await aggregateEventsByUser(startTime, endTime);
  await aggregateEventsByProduct(startTime, endTime);
}
```

### Session Cleanup Job
```typescript
// src/lib/jobs/session-cleanup.job.ts
export const sessionCleanupJob = new CronJob(
  '0 0 * * *', // Daily at midnight
  async () => {
    await cleanupOldSessions();
  },
  null,
  true,
  'UTC'
);

async function cleanupOldSessions() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  await prisma.session.deleteMany({
    where: {
      startedAt: {
        lt: thirtyDaysAgo,
      },
    },
  });
}
```

## 5. Frontend Integration

### Event Tracking Client
```typescript
// src/lib/event-tracking/client.ts
class EventTracker {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.userId = this.getUserId();
  }

  track(eventType: EventType, properties?: Record<string, any>) {
    const event = {
      eventType,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    // Send to API
    fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(err => console.error('Event tracking failed:', err));
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('event_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('event_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('user_id', userId);
  }
}

export const eventTracker = new EventTracker();
```

### React Hook
```typescript
// src/hooks/useEventTracking.ts
import { useEffect } from 'react';
import { eventTracker } from '@/lib/event-tracking/client';

export function useEventTracking() {
  useEffect(() => {
    // Track page view
    eventTracker.track('PAGE_VIEW', {
      path: window.location.pathname,
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        eventTracker.track('SCROLL_DEPTH', { depth: scrollDepth });
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Track time on page on unmount
    const startTime = Date.now();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const duration = Math.round((Date.now() - startTime) / 1000);
      eventTracker.track('TIME_ON_PAGE', { duration });
    };
  }, []);

  return eventTracker;
}
```

## 6. Performance Considerations

### Database Optimization
- **Partitioning**: Partition `analytics_events` table by date (monthly partitions)
- **Indexes**: Composite indexes on frequently queried columns
- **Archiving**: Archive events older than 90 days to cold storage
- **Connection Pooling**: Use connection pool for high-volume writes

### Caching Strategy
- **Redis Cache**: Cache recent events in Redis for real-time analytics
- **Aggregation Cache**: Cache aggregated metrics with 5-minute TTL
- **Session Cache**: Cache active sessions in Redis

### Queue Optimization
- **Batch Processing**: Process events in batches of 100
- **Priority Queues**: Separate queues for high-priority events (purchase, checkout)
- **Backpressure**: Implement queue size monitoring

### Write Optimization
- **Bulk Inserts**: Use bulk insert for batch events
- **Async Writes**: All writes go through queue, never block API
- **Retry Logic**: Exponential backoff for failed writes

## 7. Security Considerations

### Data Privacy
- **PII Masking**: Mask IP addresses before storage
- **User Consent**: Respect opt-out preferences
- **Data Retention**: Automatic deletion after retention period
- **GDPR Compliance**: Provide data export/deletion endpoints

### Access Control
- **API Authentication**: Require valid session for event tracking
- **Rate Limiting**: Limit event tracking per user/session
- **Input Validation**: Validate all event properties
- **XSS Prevention**: Sanitize event properties

### Fraud Detection
- **Bot Detection**: Identify and filter bot traffic
- **Event Validation**: Validate event sequences
- **Rate Limiting**: Detect suspicious activity patterns

## 8. Scalability Strategy

### Horizontal Scaling
- **Queue Clustering**: BullMQ clustering for multiple workers
- **Database Sharding**: Shard events by organizationId
- **Read Replicas**: Use read replicas for analytics queries

### Vertical Scaling
- **Connection Pooling**: Optimize database connection pool size
- **Memory Optimization**: Use streaming for large result sets
- **CPU Optimization**: Use worker threads for CPU-intensive tasks

### Auto-scaling
- **Queue-based Scaling**: Scale workers based on queue size
- **Load-based Scaling**: Scale API based on request rate
- **Scheduled Scaling**: Scale up during peak hours

## 9. Deployment Checklist

### Pre-Deployment
- [ ] Prisma schema migration applied
- [ ] Event tracking API endpoints deployed
- [ ] BullMQ queues configured
- [ ] Background workers deployed
- [ ] Cron jobs scheduled
- [ ] Database indexes created
- [ ] Redis cache configured
- [ ] Monitoring configured

### Deployment
- [ ] Deploy API endpoints
- [ ] Deploy background workers
- [ ] Deploy cron jobs
- [ ] Run database migration
- [ ] Warm up cache

### Post-Deployment
- [ ] Verify event tracking working
- [ ] Monitor queue processing
- [ ] Monitor database performance
- [ ] Monitor Redis performance
- [ ] Verify aggregation jobs
- [ ] Check error rates

## 10. Integration Points

### CRO System
- Use events to track experiment conversions
- Track variant exposures
- Calculate conversion rates per variant

### Personalization Engine
- Use behavioral events for recommendations
- Track recommendation clicks
- Update user profiles in real-time

### Retention System
- Track user engagement events
- Calculate activity scores
- Trigger re-engagement campaigns

### BI Dashboard
- Query aggregated events for visualizations
- Real-time funnel analysis
- Cohort analysis based on events
