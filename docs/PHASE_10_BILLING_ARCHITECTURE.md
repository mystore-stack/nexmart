# PHASE 10: SUBSCRIPTION & BILLING SYSTEM - DESIGN

## System Overview

The Subscription & Billing System manages all aspects of SaaS monetization including plan management, Stripe integration, subscription lifecycle, trial management, and billing enforcement.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│              Billing Dashboard UI                         │
│              (Next.js + Stripe Elements)                  │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Plan       │  │  Stripe    │
│  Manager    │  │  Service   │
│  (Next.js)   │  │  (API)     │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Subscription│  │  Webhook   │
│  Service    │  │  Handler   │
│  (Logic)     │  │  (Events)  │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Invoice     │  │  Payment   │
│  Generator  │  │  Processor │
│  (PDF)       │  │  (Stripe)  │
└─────────────┘  └─────────────┘
```

### Billing Flow
1. **Plan Selection**: User selects plan (Starter, Growth, Pro, Enterprise)
2. **Checkout**: Stripe checkout session created
3. **Payment**: User completes payment via Stripe
4. **Subscription**: Subscription created/updated
5. **Webhook**: Stripe webhook confirms payment
6. **Activation**: Subscription activated, features unlocked
7. **Renewal**: Automatic renewal on billing cycle
8. **Cancellation**: User cancels, subscription ends at period end

## 2. Prisma Schema Updates

### Existing Subscription Model Enhancement
```prisma
model Subscription {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid @unique
  planId         String   @db.Uuid
  
  // Billing
  stripeSubscriptionId String? @unique
  stripeCustomerId   String?
  status         SubscriptionStatus @default(TRIAL)
  
  // Billing cycle
  billingCycle   BillingCycle
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  
  // Trial
  trialEndsAt    DateTime?
  
  // Cancellation
  cancelAtPeriodEnd Boolean @default(false)
  cancelledAt    DateTime?
  
  // Payment method
  defaultPaymentMethodId String?
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  plan           Plan     @relation(fields: [planId], references: [id])
  invoices       Invoice[]
  
  @@index([status])
  @@index([currentPeriodEnd])
}
```

### New Models
```prisma
model Invoice {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  subscriptionId String   @db.Uuid
  
  // Invoice details
  invoiceNumber  String   @unique
  stripeInvoiceId String? @unique
  amount         Float
  currency       String   @default("USD")
  status         InvoiceStatus @default(DRAFT)
  dueDate        DateTime?
  paidAt         DateTime?
  
  // Line items
  lineItems      Json
  
  // PDF
  invoicePdfUrl  String?
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
  @@index([subscriptionId])
  @@index([status])
  @@index([dueDate])
}

enum InvoiceStatus {
  DRAFT
  PENDING
  PAID
  FAILED
  VOID
}

model PaymentMethod {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  stripePaymentMethodId String @unique
  type           String
  last4          String?
  expiryMonth    Int?
  expiryYear     Int?
  brand          String?
  
  // Default
  isDefault      Boolean  @default(false)
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
}
```

### Model Updates
```prisma
model Organization {
  // ... existing fields
  invoices       Invoice[]
  paymentMethods PaymentMethod[]
}

model Subscription {
  // ... existing fields
  invoices       Invoice[]
}
```

## 3. API Endpoints

### Plan Management
```typescript
// GET /api/saas/plans
interface GetPlansResponse {
  success: boolean;
  plans: Plan[];
}

// GET /api/saas/plans/[slug]
interface GetPlanResponse {
  success: boolean;
  plan: Plan;
}
```

### Subscription Management
```typescript
// POST /api/saas/subscriptions/create-checkout
interface CreateCheckoutRequest {
  planId: string;
  billingCycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
}

interface CreateCheckoutResponse {
  success: boolean;
  checkoutUrl: string;
}

// GET /api/saas/subscriptions/current
interface GetCurrentSubscriptionResponse {
  success: boolean;
  subscription: Subscription;
  plan: Plan;
  usage: UsageMetrics;
}

// POST /api/saas/subscriptions/cancel
interface CancelSubscriptionRequest {
  cancelAtPeriodEnd: boolean;
}

interface CancelSubscriptionResponse {
  success: boolean;
  subscription: Subscription;
}

// POST /api/saas/subscriptions/change-plan
interface ChangePlanRequest {
  newPlanId: string;
  billingCycle: BillingCycle;
}

interface ChangePlanResponse {
  success: boolean;
  checkoutUrl?: string;
  subscription?: Subscription;
}
```

### Invoice Management
```typescript
// GET /api/saas/invoices
interface GetInvoicesRequest {
  limit?: number;
  offset?: number;
}

interface GetInvoicesResponse {
  success: boolean;
  invoices: Invoice[];
  total: number;
}

// GET /api/saas/invoices/[id]/pdf
interface GetInvoicePdfResponse {
  success: boolean;
  pdfUrl: string;
}
```

### Payment Methods
```typescript
// GET /api/saas/payment-methods
interface GetPaymentMethodsResponse {
  success: boolean;
  paymentMethods: PaymentMethod[];
}

// POST /api/saas/payment-methods/add
interface AddPaymentMethodRequest {
  paymentMethodId: string;
}

interface AddPaymentMethodResponse {
  success: boolean;
  paymentMethod: PaymentMethod;
}

// POST /api/saas/payment-methods/[id]/set-default
interface SetDefaultPaymentMethodResponse {
  success: boolean;
  paymentMethod: PaymentMethod;
}
```

## 4. Stripe Integration

### Stripe Service
```typescript
// src/lib/saas/stripe-service.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export class StripeService {
  static async createCheckoutSession(params: {
    organizationId: string;
    planId: string;
    billingCycle: BillingCycle;
    successUrl: string;
    cancelUrl: string;
  }) {
    const organization = await prisma.organization.findUnique({
      where: { id: params.organizationId },
      include: { plan: true },
    });
    
    const plan = await prisma.plan.findUnique({
      where: { id: params.planId },
    });
    
    const priceId = params.billingCycle === 'MONTHLY' 
      ? plan.stripePriceId 
      : plan.stripeYearlyPriceId;
    
    const session = await stripe.checkout.sessions.create({
      customer: organization.stripeCustomerId || undefined,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId!,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        organizationId: params.organizationId,
        planId: params.planId,
      },
    });
    
    return session;
  }
  
  static async createCustomer(params: {
    email: string;
    name: string;
  }) {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
    });
    
    return customer;
  }
  
  static async cancelSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  }
}
```

### Webhook Handler
```typescript
// src/app/api/saas/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }
  
  return Response.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.CheckoutSession) {
  const organizationId = session.metadata?.organizationId;
  const planId = session.metadata?.planId;
  
  const subscription = await prisma.subscription.create({
    data: {
      organizationId: organizationId!,
      planId: planId!,
      stripeSubscriptionId: session.subscription as string,
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  
  await prisma.organization.update({
    where: { id: organizationId },
    data: { 
      subscriptionId: subscription.id,
      stripeCustomerId: session.customer as string,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });
  
  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: subscription.status.toUpperCase(),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Create invoice record
  await prisma.invoice.create({
    data: {
      organizationId: invoice.metadata?.organizationId,
      subscriptionId: invoice.subscription as string,
      invoiceNumber: invoice.number || '',
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'PAID',
      paidAt: new Date(invoice.status_transitions?.paid_at! * 1000),
      lineItems: invoice.lines.data.map(line => ({
        description: line.description,
        amount: line.amount / 100,
      })),
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: { status: 'PAST_DUE' },
  });
}
```

## 5. Billing Logic

### Plan Configuration
```typescript
// src/lib/saas/plans.ts
export const PLANS = {
  STARTER: {
    name: 'Starter',
    slug: 'starter',
    monthlyPrice: 29,
    yearlyPrice: 290,
    trialDays: 14,
    limits: {
      users: 3,
      products: 100,
      orders: 1000,
      aiCalls: 100,
      emails: 1000,
    },
    features: {
      aiInsights: false,
      cro: false,
      advancedBI: false,
      personalization: false,
    },
  },
  GROWTH: {
    name: 'Growth',
    slug: 'growth',
    monthlyPrice: 99,
    yearlyPrice: 990,
    trialDays: 14,
    limits: {
      users: 10,
      products: 1000,
      orders: 10000,
      aiCalls: 1000,
      emails: 10000,
    },
    features: {
      aiInsights: true,
      cro: true,
      advancedBI: false,
      personalization: true,
    },
  },
  PRO: {
    name: 'Pro',
    slug: 'pro',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    trialDays: 14,
    limits: {
      users: 25,
      products: 10000,
      orders: 100000,
      aiCalls: 10000,
      emails: 50000,
    },
    features: {
      aiInsights: true,
      cro: true,
      advancedBI: true,
      personalization: true,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    slug: 'enterprise',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    trialDays: 30,
    limits: {
      users: 100,
      products: -1, // Unlimited
      orders: -1,
      aiCalls: -1,
      emails: -1,
    },
    features: {
      aiInsights: true,
      cro: true,
      advancedBI: true,
      personalization: true,
      customDomain: true,
      apiAccess: true,
    },
  },
};
```

### Trial Management
```typescript
// src/lib/saas/trial-manager.ts
export class TrialManager {
  static async startTrial(organizationId: string, planId: string) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });
    
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDays);
    
    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        planId,
        status: 'TRIAL',
        billingCycle: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
        trialEndsAt,
      },
    });
    
    return subscription;
  }
  
  static async checkTrialExpiry() {
    const expiringTrials = await prisma.subscription.findMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: { lte: new Date() },
      },
    });
    
    for (const subscription of expiringTrials) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELLED' },
      });
    }
  }
}
```

## 6. Frontend Dashboards

### Billing Dashboard
```typescript
// /admin/billing
- Current plan details
- Subscription status
- Billing cycle
- Next billing date
- Usage metrics
- Upgrade/downgrade options
- Payment methods
- Invoice history
```

### Plan Comparison
```typescript
// /admin/billing/plans
- Plan comparison table
- Feature comparison
- Pricing comparison
- Trial information
- Upgrade buttons
```

### Invoice History
```typescript
// /admin/billing/invoices
- Invoice list
- Invoice status
- Download PDF
- Payment status
- Filter by date
```

## 7. Security Considerations

### Stripe Security
- Webhook signature verification
- API key security
- Customer data protection
- PCI compliance

### Data Security
- Encrypted payment methods
- Secure invoice storage
- Audit logging
- Access control

## 8. Scalability Considerations

### Billing Performance
- Webhook processing queue
- Invoice generation batching
- Payment method caching
- Subscription status caching

### Stripe Rate Limits
- Retry logic with exponential backoff
- Idempotency keys
- Batch operations
- Optimistic locking

## 9. Deployment Strategy

### Pre-Deployment
- [ ] Stripe account configured
- [ ] Stripe products and prices created
- [ ] Webhook endpoint configured
- [ ] Environment variables set
- [ ] Prisma schema migration applied

### Deployment
- [ ] Deploy API endpoints
- [ ] Deploy webhook handler
- [ ] Run database migration
- [ ] Configure Stripe webhooks
- [ ] Test checkout flow

### Post-Deployment
- [ ] Verify webhook processing
- [ ] Test subscription creation
- [ ] Test plan changes
- [ ] Test cancellation flow
- [ ] Monitor billing metrics
