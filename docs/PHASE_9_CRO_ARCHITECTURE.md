# PHASE 9: CRO SYSTEM - ARCHITECTURE DESIGN

## System Overview

The Conversion Rate Optimization (CRO) System enables A/B testing, multivariate testing, and conversion funnel optimization. It provides the infrastructure to run experiments, track conversions, and measure revenue impact.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────┐
│   Client    │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Request Experiment
       ▼
┌─────────────────┐
│  Experiment API│
│  /api/cro/*    │
└──────┬──────────┘
       │
       │ 2. Get Variant Assignment
       ▼
┌─────────────────┐
│  Assignment    │
│  Engine        │
│  (Hash-based)  │
└──────┬──────────┘
       │
       │ 3. Track Exposure
       ▼
┌─────────────────┐
│  Event Tracking │
│  System         │
└─────────────────┘
       │
       │ 4. Track Conversion
       ▼
┌─────────────────┐
│  Analytics      │
│  Aggregation   │
└──────┬──────────┘
       │
       │ 5. Calculate Results
       ▼
┌─────────────────┐
│  Results       │
│  Dashboard     │
└─────────────────┘
```

### Experiment Flow
1. **Client** requests experiment variant
2. **Assignment Engine** assigns variant based on user hash
3. **Event Tracking** records exposure
4. **Conversion Tracking** records goal completion
5. **Analytics** aggregates and calculates statistical significance

## 2. Prisma Schema Additions

### New Enums
```prisma
enum ExperimentStatus {
  DRAFT
  RUNNING
  PAUSED
  COMPLETED
  ARCHIVED
}

enum ExperimentType {
  AB_TEST
  MULTIVARIATE
  SPLIT_URL
  FEATURE_FLAG
}

enum VariantType {
  CONTROL
  VARIANT_A
  VARIANT_B
  VARIANT_C
  VARIANT_D
}

enum ExperimentGoal {
  ADD_TO_CART
  CHECKOUT_STARTED
  PURCHASE
  SIGN_UP
  PAGE_VIEW
  BUTTON_CLICK
  FORM_SUBMISSION
}
```

### New Models
```prisma
model Experiment {
  id             String           @id @default(uuid()) @db.Uuid
  organizationId String           @db.Uuid
  name           String
  description    String?
  type           ExperimentType
  status         ExperimentStatus @default(DRAFT)
  
  // Configuration
  trafficSplit   Float           @default(0.5) // 0-1, percentage for variant A
  startDate      DateTime?
  endDate        DateTime?
  
  // Goals
  primaryGoal    ExperimentGoal
  secondaryGoals Json            // Array of ExperimentGoal
  
  // Targeting
  targetAudience Json?           // Targeting rules
  excludeAudience Json?          // Exclusion rules
  
  // Results
  totalExposures Int             @default(0)
  totalConversions Int           @default(0)
  controlConversions Int         @default(0)
  variantConversions Int         @default(0)
  controlRevenue  Float           @default(0)
  variantRevenue  Float           @default(0)
  conversionRate Float           @default(0)
  uplift         Float?           // Percentage improvement
  statisticalSignificance Boolean @default(false)
  pValue         Float?
  
  // Timestamps
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  startedAt      DateTime?
  completedAt    DateTime?
  
  // Relations
  organization   Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  variants       ExperimentVariant[]
  exposures      ExperimentExposure[]
  
  @@index([organizationId, status])
  @@index([organizationId, type])
  @@index([startDate, endDate])
}

model ExperimentVariant {
  id             String       @id @default(uuid()) @db.Uuid
  experimentId   String       @db.Uuid
  name           String
  type           VariantType
  description    String?
  
  // Configuration
  config         Json        // Variant-specific configuration
  weight         Float       @default(0.5) // Traffic weight
  
  // Results
  exposures      Int         @default(0)
  conversions    Int         @default(0)
  revenue        Float       @default(0)
  conversionRate Float       @default(0)
  
  // Timestamps
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  
  // Relations
  experiment     Experiment  @relation(fields: [experimentId], references: [id], onDelete: Cascade)
  exposures      ExperimentExposure[]
  
  @@unique([experimentId, type])
  @@index([experimentId])
}

model ExperimentExposure {
  id             String       @id @default(uuid()) @db.Uuid
  experimentId   String       @db.Uuid
  variantId      String       @db.Uuid
  userId         String?      @db.Uuid
  sessionId      String?      @db.Uuid
  
  // Context
  url            String?
  referrer       String?
  userAgent      String?
  
  // Timestamps
  exposedAt      DateTime    @default(now())
  convertedAt    DateTime?
  
  // Relations
  experiment     Experiment  @relation(fields: [experimentId], references: [id], onDelete: Cascade)
  variant        ExperimentVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  @@index([experimentId, userId])
  @@index([experimentId, sessionId])
  @@index([variantId])
  @@index([exposedAt])
}
```

### Model Updates
```prisma
model Organization {
  // ... existing fields
  experiments    Experiment[]
}
```

## 3. API Endpoints

### Create Experiment
```typescript
// POST /api/cro/experiments
interface CreateExperimentRequest {
  name: string;
  description?: string;
  type: ExperimentType;
  trafficSplit: number;
  primaryGoal: ExperimentGoal;
  secondaryGoals?: ExperimentGoal[];
  targetAudience?: Record<string, any>;
  startDate?: string;
  endDate?: string;
}

interface CreateExperimentResponse {
  success: boolean;
  experiment: Experiment;
}
```

### Get Experiment
```typescript
// GET /api/cro/experiments/:id
interface GetExperimentResponse {
  success: boolean;
  experiment: Experiment;
  variants: ExperimentVariant[];
  results: ExperimentResults;
}
```

### List Experiments
```typescript
// GET /api/cro/experiments
interface ListExperimentsRequest {
  status?: ExperimentStatus;
  type?: ExperimentType;
  limit?: number;
  offset?: number;
}

interface ListExperimentsResponse {
  success: boolean;
  experiments: Experiment[];
  total: number;
}
```

### Get Variant Assignment
```typescript
// GET /api/cro/experiments/:id/assign
interface GetAssignmentResponse {
  success: boolean;
  variant: ExperimentVariant;
  experimentId: string;
}
```

### Track Conversion
```typescript
// POST /api/cro/experiments/:id/convert
interface TrackConversionRequest {
  variantId: string;
  goal: ExperimentGoal;
  value?: number; // Revenue value
}

interface TrackConversionResponse {
  success: boolean;
}
```

### Get Experiment Results
```typescript
// GET /api/cro/experiments/:id/results
interface ExperimentResultsResponse {
  success: boolean;
  results: {
    totalExposures: number;
    totalConversions: number;
    control: {
      exposures: number;
      conversions: number;
      revenue: number;
      conversionRate: number;
    };
    variant: {
      exposures: number;
      conversions: number;
      revenue: number;
      conversionRate: number;
    };
    uplift: number;
    statisticalSignificance: boolean;
    pValue: number;
    confidence: number;
  };
}
```

### Update Experiment Status
```typescript
// PATCH /api/cro/experiments/:id/status
interface UpdateStatusRequest {
  status: ExperimentStatus;
}

interface UpdateStatusResponse {
  success: boolean;
  experiment: Experiment;
}
```

## 4. Background Jobs / Queues

### Experiment Results Calculation Job
```typescript
// src/lib/jobs/experiment-results.job.ts
import { CronJob } from 'cron';

export const experimentResultsJob = new CronJob(
  '0 */30 * * * *', // Every 30 minutes
  async () => {
    await calculateExperimentResults();
  },
  null,
  true,
  'UTC'
);

async function calculateExperimentResults() {
  const runningExperiments = await prisma.experiment.findMany({
    where: { status: 'RUNNING' },
  });

  for (const experiment of runningExperiments) {
    await updateExperimentResults(experiment.id);
  }
}

async function updateExperimentResults(experimentId: string) {
  // Calculate conversions per variant
  // Calculate statistical significance
  // Update experiment metrics
}
```

### Experiment Auto-Stop Job
```typescript
// src/lib/jobs/experiment-auto-stop.job.ts
export const experimentAutoStopJob = new CronJob(
  '0 * * * * *', // Every hour
  async () => {
    await checkExperimentEndDates();
  },
  null,
  true,
  'UTC'
);

async function checkExperimentEndDates() {
  const now = new Date();
  
  await prisma.experiment.updateMany({
    where: {
      status: 'RUNNING',
      endDate: {
        lte: now,
      },
    },
    data: {
      status: 'COMPLETED',
      completedAt: now,
    },
  });
}
```

## 5. Frontend Dashboards

### Experiments List Page
```typescript
// src/app/admin/cro/experiments/page.tsx
- List all experiments
- Filter by status, type
- Quick stats (running, completed, paused)
- Create new experiment button
```

### Experiment Detail Page
```typescript
// src/app/admin/cro/experiments/[id]/page.tsx
- Experiment configuration
- Variant assignments
- Real-time results
- Conversion rates
- Revenue impact
- Statistical significance
- Charts (conversion over time)
```

### Experiment Results Dashboard
```typescript
// src/app/admin/cro/experiments/[id]/results/page.tsx
- Detailed results
- Funnel analysis per variant
- Cohort analysis
- Statistical tests
- Confidence intervals
```

## 6. Event Tracking Integration

### Exposure Tracking
```typescript
// Track when user is exposed to experiment variant
eventTracker.track('EXPERIMENT_EXPOSED', {
  experimentId,
  variantId,
  variantType,
});
```

### Conversion Tracking
```typescript
// Track when user completes goal
eventTracker.track('EXPERIMENT_CONVERSION', {
  experimentId,
  variantId,
  goal,
  value,
});
```

## 7. Performance Considerations

### Assignment Engine
- **Hash-based assignment**: Consistent user-to-variant mapping
- **Cached assignments**: Redis cache for variant assignments
- **No database queries**: Assignment done in memory

### Results Calculation
- **Incremental updates**: Update results incrementally
- **Batch processing**: Calculate results in batches
- **Cached results**: Cache results for dashboard

### Database Optimization
- **Indexes**: Composite indexes on experimentId, userId, sessionId
- **Partitioning**: Partition exposures by date
- **Archiving**: Archive old experiment data

## 8. Security Considerations

### Access Control
- **Admin-only**: Only admins can create experiments
- **Organization isolation**: Experiments scoped to organization
- **API authentication**: Require authentication for all endpoints

### Data Privacy
- **Anonymization**: Anonymize user data in results
- **Consent**: Respect user consent for experiments
- **GDPR compliance**: Provide data export/deletion

### Fraud Prevention
- **Bot detection**: Exclude bot traffic from results
- **Frequency limiting**: Limit exposure tracking
- **Validation**: Validate conversion events

## 9. Scalability Strategy

### Horizontal Scaling
- **Assignment engine**: Stateless, can scale horizontally
- **Results calculation**: Can be distributed across workers
- **Database sharding**: Shard by organizationId

### Caching Strategy
- **Variant assignments**: Redis cache with 1-hour TTL
- **Results cache**: Redis cache with 5-minute TTL
- **Experiment config**: Redis cache for active experiments

### Auto-scaling
- **Queue-based scaling**: Scale based on exposure queue size
- **Load-based scaling**: Scale API based on request rate

## 10. Deployment Checklist

### Pre-Deployment
- [ ] Prisma schema migration applied
- [ ] Experiment API endpoints deployed
- [ ] Assignment engine deployed
- [ ] Background jobs scheduled
- [ ] Redis cache configured
- [ ] Monitoring configured

### Deployment
- [ ] Deploy API endpoints
- [ ] Deploy background jobs
- [ ] Run database migration
- [ ] Warm up cache

### Post-Deployment
- [ ] Verify experiment creation
- [ ] Verify variant assignment
- [ ] Verify conversion tracking
- [ ] Verify results calculation
- [ ] Monitor performance
