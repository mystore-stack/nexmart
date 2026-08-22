# PHASE 9: MARKETING AUTOMATION HUB - ARCHITECTURE DESIGN

## System Overview

The Marketing Automation Hub centralizes all marketing campaigns, email sequences, SMS campaigns, and push notifications. It provides a unified interface for creating, managing, and tracking marketing automation workflows.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│         Marketing Automation Dashboard UI                  │
│              (Next.js + Workflow Editor)                   │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Campaign    │  │  Workflow   │
│  Manager    │  │  Engine    │
│  (Next.js)   │  │  (Rules)   │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Email       │  │  SMS        │
│  Service     │  │  Service   │
│  (SendGrid)  │  │  (Twilio)  │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Event      │  │  User       │
│  Tracking   │  │  Data      │
│  System     │  │            │
└─────────────┘  └────────────┘
```

### Marketing Automation Flow
1. **Campaign Creation**: Create marketing campaign with triggers
2. **Workflow Execution**: Execute workflow based on triggers
3. **Channel Delivery**: Send via email, SMS, or push notification
4. **Event Tracking**: Track opens, clicks, conversions
5. **Analytics**: Measure campaign performance

## 2. Prisma Schema Additions

### New Enums
```prisma
enum CampaignType {
  EMAIL
  SMS
  PUSH_NOTIFICATION
  MULTI_CHANNEL
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  RUNNING
  PAUSED
  COMPLETED
  CANCELLED
}

enum TriggerType {
  USER_SIGNUP
  PURCHASE
  ABANDONED_CART
  BIRTHDAY
  INACTIVITY
  CUSTOM_EVENT
}
```

### New Models
```prisma
model MarketingCampaign {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  name           String
  type           CampaignType
  status         CampaignStatus @default(DRAFT)
  
  // Campaign content
  subject        String?
  content        String
  templateId     String?
  
  // Targeting
  targetSegments Json?
  targetUsers     Json?
  
  // Scheduling
  scheduledAt    DateTime?
  sentAt         DateTime?
  
  // Results
  targetCount    Int      @default(0)
  sentCount      Int      @default(0)
  openedCount    Int      @default(0)
  clickedCount   Int      @default(0)
  convertedCount Int      @default(0)
  revenueImpact  Float    @default(0)
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  workflows      MarketingWorkflow[]
  
  @@index([organizationId, status])
  @@index([scheduledAt])
}

model MarketingWorkflow {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  name           String
  triggerType    TriggerType
  triggerConfig  Json
  
  // Workflow steps
  steps          Json
  
  // Status
  active         Boolean  @default(true)
  
  // Results
  executedCount  Int      @default(0)
  convertedCount Int      @default(0)
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  campaign       MarketingCampaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  campaignId     String?  @db.Uuid
  
  @@index([organizationId, active])
  @@index([triggerType])
}

model CampaignEvent {
  id             String   @id @default(uuid()) @db.Uuid
  campaignId     String   @db.Uuid
  userId         String   @db.Uuid
  
  // Event type
  eventType      String
  
  // Event data
  eventData      Json?
  
  // Timestamps
  occurredAt     DateTime @default(now())
  
  // Relations
  campaign       MarketingCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([campaignId, userId])
  @@index([userId, eventType])
  @@index([occurredAt])
}
```

### Model Updates
```prisma
model Organization {
  // ... existing fields
  marketingCampaigns MarketingCampaign[]
  marketingWorkflows MarketingWorkflow[]
}

model User {
  // ... existing fields
  campaignEvents CampaignEvent[]
}
```

## 3. API Endpoints

### Get Campaigns
```typescript
// GET /api/marketing/campaigns
interface GetCampaignsResponse {
  success: boolean;
  campaigns: MarketingCampaign[];
}
```

### Create Campaign
```typescript
// POST /api/marketing/campaigns
interface CreateCampaignRequest {
  name: string;
  type: CampaignType;
  subject?: string;
  content: string;
  targetSegments?: string[];
  scheduledAt?: string;
}

interface CreateCampaignResponse {
  success: boolean;
  campaign: MarketingCampaign;
}
```

### Get Workflows
```typescript
// GET /api/marketing/workflows
interface GetWorkflowsResponse {
  success: boolean;
  workflows: MarketingWorkflow[];
}
```

### Create Workflow
```typescript
// POST /api/marketing/workflows
interface CreateWorkflowRequest {
  name: string;
  triggerType: TriggerType;
  triggerConfig: any;
  steps: any[];
}

interface CreateWorkflowResponse {
  success: boolean;
  workflow: MarketingWorkflow;
}
```

### Get Campaign Analytics
```typescript
// GET /api/marketing/campaigns/[id]/analytics
interface GetAnalyticsResponse {
  success: boolean;
  data: {
    sentRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenueImpact: number;
  };
}
```

## 4. Background Jobs / Queues

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
  
  const campaigns = await prisma.marketingCampaign.findMany({
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

### Workflow Execution Job
```typescript
// src/lib/jobs/workflow-execution.job.ts
export const workflowExecutionJob = new CronJob(
  '*/1 * * * *', // Every minute
  async () => {
    await executeWorkflows();
  },
  null,
  true,
  'UTC'
);

async function executeWorkflows() {
  const workflows = await prisma.marketingWorkflow.findMany({
    where: { active: true },
  });
  
  for (const workflow of workflows) {
    await checkAndExecuteWorkflow(workflow.id);
  }
}
```

## 5. Email Service Integration

### SendGrid Integration
```typescript
// src/lib/marketing/email-service.ts
export class EmailService {
  static async sendCampaign(campaignId: string, userId: string) {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    // Send email via SendGrid
    await sendgrid.send({
      to: user.email,
      subject: campaign.subject,
      html: campaign.content,
    });
    
    // Track event
    await trackCampaignEvent(campaignId, userId, 'SENT');
  }
}
```

## 6. SMS Service Integration

### Twilio Integration
```typescript
// src/lib/marketing/sms-service.ts
export class SMSService {
  static async sendCampaign(campaignId: string, userId: string) {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    // Send SMS via Twilio
    await twilio.messages.create({
      to: user.phone,
      body: campaign.content,
    });
    
    // Track event
    await trackCampaignEvent(campaignId, userId, 'SENT');
  }
}
```

## 7. Frontend Dashboards

### Campaign Dashboard
```typescript
// src/app/admin/marketing/campaigns/page.tsx
- Active campaigns
- Campaign performance
- Campaign creation wizard
- Campaign templates
```

### Workflow Dashboard
```typescript
// src/app/admin/marketing/workflows/page.tsx
- Active workflows
- Workflow performance
- Workflow builder
- Trigger configuration
```

### Analytics Dashboard
```typescript
// src/app/admin/marketing/analytics/page.tsx
- Campaign metrics
- Channel performance
- Conversion rates
- Revenue impact
```

## 8. Performance Considerations

### Campaign Performance
- **Batch Sending**: Send campaigns in batches
- **Rate Limiting**: Respect email/SMS rate limits
- **Queue Processing**: Use queues for campaign execution

### Workflow Performance
- **Event-driven**: Execute workflows on events
- **Debouncing**: Debounce trigger events
- **Performance Tracking**: Track workflow execution time

## 9. Security Considerations

### Access Control
- **Admin-only**: Only admins can access marketing tools
- **Organization isolation**: Marketing data scoped to organization

### Data Privacy
- **Consent**: Respect user consent for marketing
- **Opt-out**: Allow users to opt-out of campaigns
- **GDPR Compliance**: Comply with GDPR requirements

## 10. Deployment Checklist

### Pre-Deployment
- [ ] Prisma schema migration applied
- [ ] Marketing API endpoints deployed
- [ ] Background jobs scheduled
- [ ] Email service configured (SendGrid)
- [ ] SMS service configured (Twilio)

### Deployment
- [ ] Deploy API endpoints
- [ ] Deploy background jobs
- [ ] Run database migration
- [ ] Configure email/SMS services

### Post-Deployment
- [ ] Verify campaign execution
- [ ] Verify workflow execution
- [ ] Monitor campaign performance
- [ ] Monitor email/SMS delivery rates
