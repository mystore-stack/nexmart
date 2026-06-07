# Production-Grade Audit System - Architecture & Deployment Guide

## 📋 Table of Contents
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Components Overview](#components-overview)
- [Setup Instructions](#setup-instructions)
- [Deployment Guide](#deployment-guide)
- [Best Practices](#best-practices)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Checkout    │  │  Cart        │  │  Admin       │         │
│  │  Page        │  │  Components  │  │  Dashboard   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         └─────────────────┴─────────────────┘                  │
│                           │                                    │
│                    ┌──────▼──────┐                             │
│                    │  Audit SDK   │                             │
│                    │  (Client)    │                             │
│                    └──────┬──────┘                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────▼─────────────────────────────────────┐
│                         API Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  /audit/     │  │  /audit/     │  │  /audit/     │         │
│  │  session     │  │  events      │  │  replay      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         └─────────────────┴─────────────────┘                  │
│                           │                                    │
│                    ┌──────▼──────┐                             │
│                    │  Audit SDK   │                             │
│                    │  (Server)    │                             │
│                    └──────┬──────┘                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │ Prisma
┌───────────────────────────▼─────────────────────────────────────┐
│                      Database Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  AuditEvent  │  │  AuditSession│  │  AuditReplay │         │
│  │  (Immutable) │  │  (Mutable)   │  │  (Snapshot)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐                                                │
│  │  AuditAlert  │                                                │
│  │  (Alerts)    │                                                │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
                            │ Webhooks
┌───────────────────────────▼─────────────────────────────────────┐
│                    Automation Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  n8n         │  │  WhatsApp    │  │  Email       │         │
│  │  Workflows   │  │  API         │  │  Service     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Event-Driven Architecture**: Every action is logged as an immutable event
2. **Immutable Events**: Audit events cannot be modified after creation
3. **Session-Based**: Events are grouped into sessions for replay capability
4. **Real-Time Processing**: Fraud detection and anomaly detection happen synchronously
5. **Scalable Design**: Supports 100k+ events/day with proper indexing
6. **Multi-Tenancy**: Organization-scoped audit data

---

## 🗄️ Database Schema

### Core Tables

#### `AuditEvent` (Immutable event log)
```sql
- id: UUID (Primary Key)
- sessionId: UUID (Foreign Key)
- eventType: Enum (30+ event types)
- userId: UUID (Foreign Key, nullable)
- organizationId: UUID (Foreign Key)
- orderId: UUID (Foreign Key, nullable)
- cartSnapshot: JSONB (Full cart state)
- metadata: JSONB (Event-specific data)
- ipAddress: String
- userAgent: String
- fraudScore: Float (0-100)
- anomalyFlags: String[]
- replayId: UUID (Foreign Key, nullable)
- createdAt: Timestamp

Indexes:
- (sessionId)
- (eventType)
- (userId)
- (organizationId)
- (orderId)
- (createdAt)
- (fraudScore)
- (organizationId, createdAt) - Composite for time-series queries
```

#### `AuditSession` (Session tracking)
```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key, nullable)
- organizationId: UUID (Foreign Key)
- userAgent: String
- ipAddress: String
- referrer: String
- startTime: Timestamp
- endTime: Timestamp (nullable)
- eventCount: Integer
- completedSteps: String[]
- abandonedAt: Timestamp (nullable)
- conversionValue: Float (nullable)
- fraudScore: Float (0-100)
- metadata: JSONB

Indexes:
- (userId)
- (organizationId)
- (startTime)
- (endTime)
- (fraudScore)
```

#### `AuditReplay` (Session replay snapshots)
```sql
- id: UUID (Primary Key)
- sessionId: UUID (Foreign Key)
- userId: UUID (Foreign Key, nullable)
- organizationId: UUID (Foreign Key)
- name: String
- description: String (nullable)
- events: JSONB (Ordered event list)
- cartStates: JSONB (Cart state at each step)
- replayData: JSONB (Additional context)
- createdAt: Timestamp
- replayedAt: Timestamp (nullable)
- replayedBy: UUID (Foreign Key, nullable)

Indexes:
- (sessionId)
- (userId)
- (organizationId)
- (createdAt)
```

#### `AuditAlert` (Alert management)
```sql
- id: UUID (Primary Key)
- sessionId: UUID (Foreign Key, nullable)
- userId: UUID (Foreign Key, nullable)
- organizationId: UUID (Foreign Key)
- alertType: Enum (8 alert types)
- severity: Enum (LOW, MEDIUM, HIGH, CRITICAL)
- title: String
- description: String (nullable)
- metadata: JSONB
- resolved: Boolean (default: false)
- resolvedAt: Timestamp (nullable)
- resolvedBy: UUID (Foreign Key, nullable)
- createdAt: Timestamp

Indexes:
- (sessionId)
- (userId)
- (organizationId)
- (alertType)
- (severity)
- (resolved)
- (createdAt)
```

### Event Types

```typescript
// Checkout flow events
CHECKOUT_START
CHECKOUT_STEP_ADDRESS
CHECKOUT_STEP_PAYMENT
CHECKOUT_STEP_REVIEW
CHECKOUT_COMPLETE
CHECKOUT_ABANDONED

// Payment events
PAYMENT_INITIATED
PAYMENT_SUCCESS
PAYMENT_FAILED
PAYMENT_RETRY

// Cart events
CART_VIEWED
CART_ITEM_ADDED
CART_ITEM_REMOVED
CART_ITEM_UPDATED
CART_CLEARED
COUPON_APPLIED
COUPON_REMOVED

// Order events
ORDER_CREATED
ORDER_UPDATED
ORDER_CANCELLED
ORDER_REFUNDED

// User events
USER_LOGIN
USER_LOGOUT
USER_REGISTER
ADDRESS_ADDED
ADDRESS_UPDATED

// Error events
CHECKOUT_ERROR
PAYMENT_ERROR
VALIDATION_ERROR
SYSTEM_ERROR
```

---

## 🧩 Components Overview

### 1. Audit SDK (Client)

**Location**: `src/lib/audit/client.ts`

**Features**:
- Automatic session initialization
- Event batching (5-second flush interval)
- Local storage persistence
- Automatic session abandonment detection
- Type-safe event logging

**Usage**:
```typescript
import { audit } from "@/lib/audit/client";

// Initialize (auto on page load)
await audit.initSession();

// Track events
await audit.checkout.start(cartItems);
await audit.payment.initiated(amount, "STRIPE");
await audit.checkout.complete(orderId, total);
```

### 2. Audit SDK (Server)

**Location**: `src/lib/audit/server.ts`

**Features**:
- Fraud detection engine
- Anomaly detection engine
- Automatic alert creation
- Webhook triggers for n8n
- Session management
- Replay creation

**Usage**:
```typescript
import { audit } from "@/lib/audit/server";

// Log event with automatic fraud detection
await audit.event({
  eventType: "ORDER_CREATED",
  userId: user.id,
  organizationId: org.id,
  orderId: order.id,
  metadata: { total: order.total }
});

// Create session
const session = await audit.session.create({
  userId: user.id,
  organizationId: org.id,
  userAgent: req.headers.get("user-agent")
});
```

### 3. Replay Engine

**Location**: `src/lib/audit/replay.ts`

**Features**:
- Session reconstruction
- Step-by-step replay
- Pattern analysis
- Race condition detection
- Performance timing analysis

**Usage**:
```typescript
import { replayEngine } from "@/lib/audit/replay";

// Reconstruct session
const replay = await replayEngine.reconstructSession(sessionId);

// Analyze patterns
const analysis = await replayEngine.analyzeSession(sessionId);

// Detect race conditions
const raceConditions = await replayEngine.detectRaceConditions(sessionId);
```

### 4. API Routes

**Session Management**:
- `POST /api/audit/session` - Create session
- `GET /api/audit/session` - Query sessions
- `POST /api/audit/session/complete` - Mark complete
- `POST /api/audit/session/abandon` - Mark abandoned

**Event Logging**:
- `POST /api/audit/events` - Log single event
- `POST /api/audit/events/batch` - Log multiple events
- `GET /api/audit/events` - Query events with filters

**Replay Management**:
- `POST /api/audit/replay` - Create replay
- `GET /api/audit/replay` - Query replays

**Alert Management**:
- `GET /api/audit/alerts` - Query alerts
- `PATCH /api/audit/alerts` - Resolve alert

**Statistics**:
- `GET /api/audit/stats` - Get session statistics

### 5. Admin Dashboard

**Location**: `src/app/admin/audit/page.tsx`

**Features**:
- Real-time event stream
- Fraud score visualization
- Alert management
- Session replay interface
- Statistics dashboard
- Filtering and search

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- n8n (for automation workflows)
- Next.js 14+

### Step 1: Database Schema Migration

```bash
# Generate Prisma client with new schema
npm run db:generate

# Push schema to database
npm run db:push

# Or use migration (recommended for production)
npm run db:migrate
```

### Step 2: Environment Variables

Add to your `.env` file:

```env
# Audit Webhook (n8n)
N8N_AUDIT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/audit

# Optional: Supabase Realtime (for real-time dashboard)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: n8n Workflow Setup

1. Import the workflow JSON files from `marketing-automation/workflows/`:
   - `audit-order-created.json`
   - `audit-payment-failed.json`
   - `audit-fraud-detected.json`

2. Configure webhook URLs in n8n to match your environment

3. Set up credentials:
   - Supabase (for database operations)
   - Email (SendGrid/Resend)
   - WhatsApp (Twilio or WhatsApp Business API)

### Step 5: Test the Integration

```typescript
// Test client SDK
import { audit } from "@/lib/audit/client";

await audit.initSession();
await audit.checkout.start([{ id: "123", name: "Test Product" }]);

// Test server SDK
import { audit } from "@/lib/audit/server";

await audit.event({
  eventType: "CHECKOUT_START",
  userId: "user-id",
  organizationId: "org-id",
  metadata: { test: true }
});
```

---

## 📦 Deployment Guide

### Production Deployment Checklist

#### 1. Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_audit_events_session_created 
ON audit_events(sessionId, createdAt DESC);

CREATE INDEX CONCURRENTLY idx_audit_events_org_created 
ON audit_events(organizationId, createdAt DESC);

CREATE INDEX CONCURRENTLY idx_audit_events_fraud 
ON audit_events(fraudScore) 
WHERE fraudScore > 50;

-- Partition audit_events by month (for high-volume systems)
-- This is optional for systems with >1M events/day
```

#### 2. Connection Pooling

Configure Prisma connection pool in `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  // Connection pool settings
  connection_limit = 10
}
```

#### 3. Caching Strategy

Implement Redis caching for frequently accessed audit data:

```typescript
// Cache session data
const cachedSession = await redis.get(`audit:session:${sessionId}`);
if (cachedSession) return JSON.parse(cachedSession);

// Cache for 5 minutes
await redis.setex(`audit:session:${sessionId}`, 300, JSON.stringify(session));
```

#### 4. Real-Time Updates

Optionally implement Supabase Realtime for live dashboard updates:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to new audit events
supabase
  .channel('audit-events')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_events' }, (payload) => {
    // Update dashboard in real-time
    updateDashboard(payload.new);
  })
  .subscribe();
```

#### 5. Monitoring & Alerting

Set up monitoring for:

- Audit event throughput (events/second)
- Fraud detection rate
- Alert resolution time
- Database query performance
- API response times

Recommended tools:
- Datadog
- New Relic
- Prometheus + Grafana

#### 6. Data Retention Policy

Implement data retention to manage storage:

```sql
-- Archive old events (older than 90 days)
CREATE TABLE audit_events_archive AS 
SELECT * FROM audit_events 
WHERE createdAt < NOW() - INTERVAL '90 days';

-- Delete archived events after 1 year
DELETE FROM audit_events_archive 
WHERE createdAt < NOW() - INTERVAL '1 year';
```

---

## 🎯 Best Practices

### 1. Event Naming

- Use descriptive, action-oriented names
- Follow the pattern: `ENTITY_ACTION` (e.g., `ORDER_CREATED`)
- Be consistent with naming conventions

### 2. Metadata Structure

```typescript
// Good metadata structure
metadata: {
  orderId: "123",
  total: 1500,
  itemCount: 3,
  paymentMethod: "STRIPE"
}

// Avoid nested structures that are hard to query
metadata: {
  order: {
    id: "123",
    total: 1500
  }
}
```

### 3. Fraud Detection Tuning

Adjust fraud detection thresholds based on your business:

```typescript
// In src/lib/audit/server.ts
// Adjust these values based on your risk tolerance

const HIGH_VALUE_THRESHOLD = 10000; // MAD
const RAPID_CHECKOUT_THRESHOLD = 3; // orders per hour
const SUSPICIOUS_IP_THRESHOLD = 5; // sessions per 24h
const COUPON_ABUSE_THRESHOLD = 5; // uses per coupon
```

### 4. Error Handling

Always wrap audit calls in try-catch to prevent audit failures from breaking your application:

```typescript
try {
  await audit.event({ ... });
} catch (error) {
  console.error("[AUDIT] Failed to log event:", error);
  // Don't throw - audit failures shouldn't break the app
}
```

### 5. Performance

- Use batch event logging for high-volume scenarios
- Implement pagination for event queries
- Cache frequently accessed session data
- Use database indexes for common query patterns

---

## ⚡ Performance Optimization

### 1. Query Optimization

```typescript
// Bad: Fetch all events
const allEvents = await prisma.auditEvent.findMany();

// Good: Use pagination and filters
const events = await prisma.auditEvent.findMany({
  where: {
    organizationId,
    createdAt: { gte: startDate }
  },
  orderBy: { createdAt: 'desc' },
  take: 100,
  skip: offset
});
```

### 2. Batch Processing

For high-volume event logging, use batch API:

```typescript
// Instead of individual calls
for (const event of events) {
  await audit.event(event);
}

// Use batch API
await fetch("/api/audit/events/batch", {
  method: "POST",
  body: JSON.stringify({ events })
});
```

### 3. Database Connection Pooling

Configure appropriate pool size based on your traffic:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30"
```

### 4. Read Replicas

For read-heavy workloads (dashboard queries), use read replicas:

```typescript
const prismaRead = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_READ_URL }
  }
});
```

---

## 🔧 Troubleshooting

### Issue: Events not appearing in dashboard

**Solution**:
1. Check browser console for client SDK errors
2. Verify webhook URL is configured correctly
3. Check server logs for audit errors
4. Ensure Prisma client is generated: `npm run db:generate`

### Issue: Fraud detection not triggering

**Solution**:
1. Check fraud score thresholds in `src/lib/audit/server.ts`
2. Verify metadata includes required fields
3. Check alert creation logic
4. Review webhook trigger configuration

### Issue: Replay not working

**Solution**:
1. Ensure session has events
2. Check cart snapshots are being saved
3. Verify replay engine is properly imported
4. Check for TypeScript errors in replay logic

### Issue: Database performance degradation

**Solution**:
1. Check query execution plans with `EXPLAIN ANALYZE`
2. Verify indexes are created
3. Implement data retention policy
4. Consider partitioning for high-volume tables

### Issue: n8n workflows not triggering

**Solution**:
1. Verify webhook URL is correct
2. Check n8n workflow is active
3. Test webhook manually with curl
4. Check n8n execution logs

---

## 📊 Monitoring Metrics

Track these metrics to ensure system health:

### Throughput Metrics
- Events per second
- Sessions per hour
- Alerts per day
- Replays created per week

### Performance Metrics
- API response time (p50, p95, p99)
- Database query time
- Fraud detection latency
- Webhook delivery time

### Business Metrics
- Conversion rate by session
- Fraud detection rate
- Alert resolution time
- Cart abandonment rate

---

## 🔒 Security Considerations

1. **Data Privacy**: Ensure PII is handled according to GDPR
2. **Access Control**: Audit logs should be organization-scoped
3. **Webhook Security**: Verify webhook signatures
4. **API Authentication**: All audit API routes require authentication
5. **Data Encryption**: Encrypt sensitive metadata at rest

---

## 📈 Scaling Strategy

### Horizontal Scaling

- Use connection pooling
- Implement read replicas
- Consider event streaming (Kafka) for very high volume
- Use CDN for static dashboard assets

### Vertical Scaling

- Increase database memory for large result sets
- Use faster storage (SSD/NVMe)
- Optimize database configuration

### Data Archiving

- Move old events to cold storage
- Implement time-based partitioning
- Use columnar storage for analytics

---

## 🎓 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [n8n Workflow Documentation](https://docs.n8n.io)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)

---

## ✅ Deployment Checklist

- [ ] Database schema migrated
- [ ] Prisma client generated
- [ ] Environment variables configured
- [ ] n8n workflows imported and configured
- [ ] Webhook URLs verified
- [ ] Audit SDK integrated in checkout flow
- [ ] Admin dashboard accessible
- [ ] Fraud detection tuned
- [ ] Monitoring configured
- [ ] Data retention policy implemented
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit performed

---

## 🆘 Support

For issues or questions:
1. Check this documentation
2. Review GitHub issues
3. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: 2025-06-07  
**Maintained By**: NexMart Development Team
