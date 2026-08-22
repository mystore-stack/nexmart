# PHASE 9: BUSINESS INTELLIGENCE LAYER - ARCHITECTURE DESIGN

## System Overview

The Business Intelligence Layer provides real-time dashboards, revenue analytics, customer segmentation, cohort analysis, and predictive analytics. It aggregates data from the Event Tracking System and other sources to provide actionable insights for business decisions.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                   BI Dashboard UI                         │
│              (Next.js + Recharts)                        │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  BI API      │  │  WebSocket │
│  (Next.js)   │  │  (Real-time)│
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Analytics   │  │  Data       │
│  Service    │  │  Warehouse  │
│  (Aggregation)│  │  (PostgreSQL)│
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Event      │  │  Redis     │
│  Tracking   │  │  (Cache)   │
│  System     │  │            │
└─────────────┘  └────────────┘
```

### Data Flow
1. **Event Tracking** captures user events
2. **Analytics Service** aggregates data in real-time
3. **Data Warehouse** stores aggregated metrics
4. **BI API** serves dashboard data
5. **WebSocket** pushes real-time updates

## 2. Prisma Schema Additions

### New Enums
```prisma
enum MetricType {
  REVENUE
  ORDERS
  USERS
  CONVERSION_RATE
  AOV
  LTV
  CHURN_RATE
  RETENTION_RATE
}

enum TimeGranularity {
  HOURLY
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}

enum CohortType {
  ACQUISITION
  BEHAVIOR
  DEMOGRAPHIC
  GEOGRAPHIC
}
```

### New Models
```prisma
model AnalyticsMetric {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  type           MetricType
  granularity   TimeGranularity
  
  // Time period
  periodStart    DateTime
  periodEnd      DateTime
  
  // Metric values
  value          Float
  previousValue  Float?
  changePercent  Float?
  
  // Dimensions
  dimensions     Json
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([organizationId, type, granularity, periodStart])
  @@index([organizationId, type])
  @@index([periodStart, periodEnd])
}

model CohortAnalysis {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  type           CohortType
  name           String
  
  // Cohort definition
  cohortStart    DateTime
  cohortEnd      DateTime
  cohortSize     Int
  
  // Retention data
  retentionData  Json
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId, type])
  @@index([cohortStart])
}

model CustomerSegment {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  name           String
  description    String?
  
  // Segment criteria
  criteria       Json
  
  // Segment metrics
  userCount      Int      @default(0)
  avgRevenue     Float    @default(0)
  avgLTV         Float    @default(0)
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
}

model PredictiveModel {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  name           String
  type           String
  version        String
  
  // Model metrics
  accuracy       Float
  precision      Float
  recall         Float
  
  // Model data
  features       Json
  coefficients  Json
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  trainedAt      DateTime?
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId, type])
}
```

### Model Updates
```prisma
model Organization {
  // ... existing fields
  analyticsMetrics AnalyticsMetric[]
  cohortAnalyses CohortAnalysis[]
  customerSegments CustomerSegment[]
  predictiveModels PredictiveModel[]
}
```

## 3. API Endpoints

### Get Revenue Analytics
```typescript
// GET /api/bi/revenue
interface GetRevenueRequest {
  startDate?: string;
  endDate?: string;
  granularity?: TimeGranularity;
}

interface GetRevenueResponse {
  success: boolean;
  data: {
    totalRevenue: number;
    previousRevenue: number;
    changePercent: number;
    byPeriod: Array<{
      period: string;
      revenue: number;
    }>;
    byCategory: Array<{
      category: string;
      revenue: number;
      percent: number;
    }>;
  };
}
```

### Get Customer Analytics
```typescript
// GET /api/bi/customers
interface GetCustomersResponse {
  success: boolean;
  data: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    churnedCustomers: number;
    segments: CustomerSegment[];
  };
}
```

### Get Cohort Analysis
```typescript
// GET /api/bi/cohorts
interface GetCohortsResponse {
  success: boolean;
  data: CohortAnalysis[];
}
```

### Get Predictive Analytics
```typescript
// GET /api/bi/predictions
interface GetPredictionsResponse {
  success: boolean;
  data: {
    churnRisk: Array<{
      userId: string;
      riskScore: number;
      reason: string;
    }>;
    ltvPrediction: Array<{
      userId: string;
      predictedLTV: number;
      confidence: number;
    }>;
    revenueForecast: Array<{
      period: string;
      predictedRevenue: number;
      confidence: number;
    }>;
  };
}
```

### Get Real-time Dashboard Data
```typescript
// GET /api/bi/dashboard
interface GetDashboardResponse {
  success: boolean;
  data: {
    revenue: number;
    orders: number;
    users: number;
    conversionRate: number;
    aov: number;
    trends: {
      revenue: number[];
      orders: number[];
      users: number[];
    };
  };
}
```

## 4. Background Jobs / Queues

### Metrics Aggregation Job
```typescript
// src/lib/jobs/metrics-aggregation.job.ts
export const metricsAggregationJob = new CronJob(
  '0 * * * * *', // Every hour
  async () => {
    await aggregateMetrics();
  },
  null,
  true,
  'UTC'
);

async function aggregateMetrics() {
  // Aggregate revenue metrics
  await aggregateRevenueMetrics();
  
  // Aggregate user metrics
  await aggregateUserMetrics();
  
  // Aggregate conversion metrics
  await aggregateConversionMetrics();
}
```

### Cohort Analysis Job
```typescript
// src/lib/jobs/cohort-analysis.job.ts
export const cohortAnalysisJob = new CronJob(
  '0 0 * * *', // Daily at midnight
  async () => {
    await runCohortAnalysis();
  },
  null,
  true,
  'UTC'
);

async function runCohortAnalysis() {
  // Calculate retention cohorts
  await calculateRetentionCohorts();
  
  // Calculate behavioral cohorts
  await calculateBehavioralCohorts();
}
```

### Predictive Model Training Job
```typescript
// src/lib/jots/predictive-training.job.ts
export const predictiveTrainingJob = new CronJob(
  '0 0 * * 0', // Weekly on Sunday
  async () => {
    await trainPredictiveModels();
  },
  null,
  true,
  'UTC'
);

async function trainPredictiveModels() {
  // Train churn prediction model
  await trainChurnModel();
  
  // Train LTV prediction model
  await trainLTVModel();
  
  // Train revenue forecasting model
  await trainRevenueForecastModel();
}
```

## 5. Frontend Dashboards

### Revenue Dashboard
```typescript
// src/app/admin/bi/revenue/page.tsx
- Total revenue with trend
- Revenue by category
- Revenue by time period
- Revenue comparison (YoY, MoM)
- Top products by revenue
```

### Customer Dashboard
```typescript
// src/app/admin/bi/customers/page.tsx
- Total customers
- New customers
- Active customers
- Churned customers
- Customer segments
- Customer LTV
```

### Cohort Analysis Dashboard
```typescript
// src/app/admin/bi/cohorts/page.tsx
- Cohort retention table
- Cohort size
- Retention rates
- Time to first purchase
- Customer lifetime value
```

### Predictive Analytics Dashboard
```typescript
// src/app/admin/bi/predictions/page.tsx
- Churn risk predictions
- LTV predictions
- Revenue forecasts
- Model accuracy metrics
```

## 6. Event Tracking Integration

### Revenue Events
```typescript
// Track revenue events for BI
eventTracker.track('REVENUE_GENERATED', {
  orderId,
  amount,
  category,
  timestamp,
});
```

### Customer Events
```typescript
// Track customer events for BI
eventTracker.track('CUSTOMER_ACQUIRED', {
  userId,
  acquisitionChannel,
  timestamp,
});
```

## 7. Performance Considerations

### Data Aggregation
- **Incremental Updates**: Update metrics incrementally
- **Batch Processing**: Process data in batches
- **Materialized Views**: Use materialized views for complex queries
- **Partitioning**: Partition metrics by date

### Caching Strategy
- **Dashboard Cache**: Cache dashboard data for 5 minutes
- **Metrics Cache**: Cache aggregated metrics for 1 hour
- **Prediction Cache**: Cache predictions for 24 hours

### Query Optimization
- **Indexed Queries**: Use indexed columns for filtering
- **Query Limits**: Limit query results
- **Pagination**: Use pagination for large datasets

## 8. Security Considerations

### Access Control
- **Admin-only**: Only admins can access BI dashboards
- **Organization isolation**: BI data scoped to organization
- **API authentication**: Require authentication for all endpoints

### Data Privacy
- **Anonymization**: Anonymize customer data
- **Aggregation**: Show only aggregated data
- **Consent**: Respect user consent for analytics

### Audit Logging
- **Access Logs**: Log all BI dashboard access
- **Query Logs**: Log all BI queries
- **Export Logs**: Log all data exports

## 9. Scalability Strategy

### Horizontal Scaling
- **API Scaling**: Stateless API can scale horizontally
- **Aggregation Scaling**: Distribute aggregation across workers
- **Dashboard Scaling**: Cache dashboard data

### Data Storage
- **Time-series Database**: Consider time-series database for metrics
- **Data Partitioning**: Partition metrics by organization and date
- **Data Archiving**: Archive old data to cold storage

### Auto-scaling
- **Queue-based scaling**: Scale based on aggregation queue size
- **Load-based scaling**: Scale API based on request rate

## 10. Deployment Checklist

### Pre-Deployment
- [ ] Prisma schema migration applied
- [ ] BI API endpoints deployed
- [ ] Background jobs scheduled
- [ ] Dashboard components deployed
- [ ] Monitoring configured

### Deployment
- [ ] Deploy API endpoints
- [ ] Deploy background jobs
- [ ] Run database migration
- [ ] Warm up cache

### Post-Deployment
- [ ] Verify dashboard loading
- [ ] Verify metrics accuracy
- [ ] Verify real-time updates
- [ ] Monitor performance
