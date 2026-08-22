# PHASE 9: RETENTION & CHURN PREVENTION SYSTEM - ARCHITECTURE DESIGN

## System Overview

The Retention & Churn Prevention System identifies at-risk customers, predicts churn likelihood, and implements automated retention campaigns. It uses machine learning models to analyze customer behavior and trigger targeted interventions.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│           Retention Dashboard UI                         │
│              (Next.js + Charts)                          │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Retention   │  │  Churn      │
│  API        │  │  Prediction │
│  (Next.js)   │  │  Service   │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Churn      │  │  Campaign  │
│  Model      │  │  Engine    │
│  (ML)       │  │  (Rules)   │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Event      │  │  User      │
│  Tracking   │  │  Profile   │
│  System     │  │  Data      │
└─────────────┘  └────────────┘
```

### Retention Flow
1. **Event Tracking** captures customer behavior
2. **Churn Model** predicts churn risk score
3. **Campaign Engine** determines retention action
4. **Retention Campaign** executes (email, SMS, offer)
5. **Result Tracking** monitors campaign effectiveness

## 2. Prisma Schema Additions

### New Enums
```prisma
enum ChurnRiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum RetentionCampaignType {
  EMAIL
  SMS
  PUSH_NOTIFICATION
  IN_APP_MESSAGE
  DISCOUNT_OFFER
  LOYALTY_REWARD
}

enum RetentionCampaignStatus {
  SCHEDULED
  RUNNING
  COMPLETED
  CANCELLED
}
```

### New Models
```prisma
model ChurnPrediction {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  userId         String   @db.Uuid
  
  // Churn risk
  riskScore      Float
  riskLevel      ChurnRiskLevel
  confidence     Float
  
  // Prediction factors
  factors        Json
  
  // Timestamps
  predictedAt    DateTime @default(now())
  validUntil     DateTime
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, predictedAt])
  @@index([organizationId, riskLevel])
  @@index([validUntil])
}

model RetentionCampaign {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  name           String
  type           RetentionCampaignType
  status         RetentionCampaignStatus @default(SCHEDULED)
  
  // Targeting
  targetSegments Json?
  targetRiskLevels Json?
  
  // Campaign content
  subject        String?
  message        String
  offer          Json?
  
  // Scheduling
  scheduledAt    DateTime
  sentAt         DateTime?
  
  // Results
  targetCount    Int      @default(0)
  sentCount      Int      @default(0)
  openedCount    Int      @default(0)
  clickedCount   Int      @default(0)
  convertedCount Int      @default(0)
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  campaignUsers  RetentionCampaignUser[]
  
  @@index([organizationId, status])
  @@index([scheduledAt])
}

model RetentionCampaignUser {
  id             String   @id @default(uuid()) @db.Uuid
  campaignId     String   @db.Uuid
  userId         String   @db.Uuid
  
  // Status
  sent           Boolean  @default(false)
  opened         Boolean  @default(false)
  clicked        Boolean  @default(false)
  converted      Boolean  @default(false)
  
  // Timestamps
  sentAt         DateTime?
  openedAt       DateTime?
  clickedAt      DateTime?
  convertedAt    DateTime?
  
  // Relations
  campaign       RetentionCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([campaignId, userId])
  @@index([campaignId, sent])
  @@index([userId])
}
```

### Model Updates
```prisma
model Organization {
  // ... existing fields
  churnPredictions ChurnPrediction[]
  retentionCampaigns RetentionCampaign[]
}

model User {
  // ... existing fields
  churnPredictions ChurnPrediction[]
  campaignUsers RetentionCampaignUser[]
}
```

## 3. API Endpoints

### Get Churn Risk Report
```typescript
// GET /api/retention/churn-risk
interface GetChurnRiskRequest {
  riskLevel?: ChurnRiskLevel;
  limit?: number;
}

interface GetChurnRiskResponse {
  success: boolean;
  data: {
    totalAtRisk: number;
    byRiskLevel: Record<ChurnRiskLevel, number>;
    users: Array<{
      userId: string;
      email: string;
      riskScore: number;
      riskLevel: ChurnRiskLevel;
      factors: any;
    }>;
  };
}
```

### Create Retention Campaign
```typescript
// POST /api/retention/campaigns
interface CreateCampaignRequest {
  name: string;
  type: RetentionCampaignType;
  targetSegments?: string[];
  targetRiskLevels?: ChurnRiskLevel[];
  subject?: string;
  message: string;
  offer?: any;
  scheduledAt: string;
}

interface CreateCampaignResponse {
  success: boolean;
  campaign: RetentionCampaign;
}
```

### Get Campaign Results
```typescript
// GET /api/retention/campaigns/[id]/results
interface GetCampaignResultsResponse {
  success: boolean;
  data: {
    campaign: RetentionCampaign;
    metrics: {
      sentRate: number;
      openRate: number;
      clickRate: number;
      conversionRate: number;
    };
  };
}
```

### Get Retention Metrics
```typescript
// GET /api/retention/metrics
interface GetRetentionMetricsResponse {
  success: boolean;
  data: {
    retentionRate: number;
    churnRate: number;
    avgLTV: number;
    campaignEffectiveness: number;
  };
}
```

## 4. Background Jobs / Queues

### Churn Prediction Job
```typescript
// src/lib/jobs/churn-prediction.job.ts
export const churnPredictionJob = new CronJob(
  '0 0 * * *', // Daily at midnight
  async () => {
    await runChurnPredictions();
  },
  null,
  true,
  'UTC'
);

async function runChurnPredictions() {
  const organizations = await prisma.organization.findMany();
  
  for (const organization of organizations) {
    await predictChurnForOrganization(organization.id);
  }
}
```

### Campaign Execution Job
```typescript
// src/lib/jobs/campaign-execution.job.ts
export const campaignExecutionJob = new CronJob(
  '*/5 * * * *', // Every 5 minutes
  async () => {
    await executeScheduledCampaigns();
  },
  null,
  true,
  'UTC'
);

async function executeScheduledCampaigns() {
  const now = new Date();
  
  const campaigns = await prisma.retentionCampaign.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { lte: now },
    },
  });
  
  for (const campaign of campaigns) {
    await executeCampaign(campaign.id);
  }
}
```

### Retention Metrics Calculation Job
```typescript
// src/lib/jobs/retention-metrics.job.ts
export const retentionMetricsJob = new CronJob(
  '0 0 * * *', // Daily at midnight
  async () => {
    await calculateRetentionMetrics();
  },
  null,
  true,
  'UTC'
);

async function calculateRetentionMetrics() {
  // Calculate retention rates
  // Calculate churn rates
  // Calculate campaign effectiveness
}
```

## 5. Churn Prediction Model

### Model Features
- **Purchase Frequency**: How often customer purchases
- **Recency**: Time since last purchase
- **Average Order Value**: Customer's average spend
- **Engagement Score**: Based on site visits, interactions
- **Support Tickets**: Number of support requests
- **Returns**: Number of returns
- **Loyalty Tier**: Customer's loyalty status

### Prediction Algorithm
```typescript
// src/lib/retention/churn-predictor.ts
export class ChurnPredictor {
  static async predictRisk(userId: string, organizationId: string) {
    const user = await getUserData(userId, organizationId);
    
    const features = {
      purchaseFrequency: calculatePurchaseFrequency(user),
      recency: calculateRecency(user),
      averageOrderValue: calculateAOV(user),
      engagementScore: calculateEngagement(user),
      supportTickets: countSupportTickets(user),
      returns: countReturns(user),
      loyaltyTier: user.loyaltyTier,
    };
    
    const riskScore = calculateRiskScore(features);
    const riskLevel = determineRiskLevel(riskScore);
    
    return {
      riskScore,
      riskLevel,
      confidence: 0.85,
      factors: features,
    };
  }
}
```

## 6. Campaign Engine

### Campaign Rules
- **High Risk**: Immediate intervention (discount offer)
- **Medium Risk**: Engagement campaign (email)
- **Low Risk**: Loyalty reward (points)

### Campaign Execution
```typescript
// src/lib/retention/campaign-engine.ts
export class CampaignEngine {
  static async executeCampaign(campaignId: string) {
    const campaign = await prisma.retentionCampaign.findUnique({
      where: { id: campaignId },
      include: { organization: true },
    });
    
    const targetUsers = await getTargetUsers(campaign);
    
    for (const user of targetUsers) {
      await sendCampaignMessage(user, campaign);
      await trackCampaignUser(campaignId, user.id);
    }
  }
}
```

## 7. Frontend Dashboards

### Churn Risk Dashboard
```typescript
// src/app/admin/retention/churn/page.tsx
- Total at-risk customers
- Churn risk distribution
- At-risk customer list
- Risk factors analysis
```

### Campaign Dashboard
```typescript
// src/app/admin/retention/campaigns/page.tsx
- Active campaigns
- Campaign performance
- Campaign creation wizard
- Campaign results
```

### Retention Metrics Dashboard
```typescript
// src/app/admin/retention/metrics/page.tsx
- Retention rate
- Churn rate
- Average LTV
- Campaign effectiveness
```

## 8. Performance Considerations

### Model Performance
- **Batch Prediction**: Predict churn for all users in batch
- **Incremental Updates**: Update predictions for active users
- **Model Caching**: Cache model predictions

### Campaign Performance
- **Queue-based Execution**: Execute campaigns via queue
- **Rate Limiting**: Respect email/SMS rate limits
- **Batch Sending**: Send messages in batches

## 9. Security Considerations

### Data Privacy
- **Consent**: Respect user consent for marketing
- **Opt-out**: Allow users to opt-out of campaigns
- **Data Minimization**: Only collect necessary data

### Access Control
- **Admin-only**: Only admins can access retention tools
- **Organization isolation**: Retention data scoped to organization

## 10. Deployment Checklist

### Pre-Deployment
- [ ] Prisma schema migration applied
- [ ] Retention API endpoints deployed
- [ ] Background jobs scheduled
- [ ] Churn model trained
- [ ] Campaign templates configured

### Deployment
- [ ] Deploy API endpoints
- [ ] Deploy background jobs
- [ ] Run database migration
- [ ] Train churn model

### Post-Deployment
- [ ] Verify churn predictions
- [ ] Verify campaign execution
- [ ] Monitor campaign performance
- [ ] Monitor retention metrics
