# NexMart Automation System Architecture

## Overview

The NexMart Automation System is a comprehensive, enterprise-grade automation framework built directly into the application. It handles 10 major categories of automation without relying on external workflow platforms like n8n, Zapier, or Make.

## Architecture Principles

- **Built-in**: All automation logic resides within the application codebase
- **Queue-based**: Uses BullMQ for async processing and job scheduling
- **Scalable**: Designed to handle high-volume operations
- **Observable**: Comprehensive logging via AutomationLog model
- **Configurable**: Environment-based configuration
- **Production-ready**: Error handling, retries, and monitoring

## System Components

### 1. Database Layer (Prisma)

**New Models:**
- `AutomationLog` - Audit trail for all automation actions
- `LoyaltyPoints` - Customer loyalty program data
- `CartAbandonment` - Abandoned cart tracking
- `CustomerSegment` - Customer classification
- `ReviewRequest` - Review request tracking
- `ReportSchedule` - Scheduled report configuration
- `Recommendation` - Product recommendations

**New Enums:**
- `AutomationType` - Types of automation actions
- `AutomationStatus` - Status of automation execution
- `LoyaltyTier` - Customer loyalty tiers (Bronze to Diamond)
- `CustomerSegmentType` - Customer segments (NEW, REGULAR, VIP, INACTIVE, CHURNED)
- `ReviewRequestStatus` - Review request states
- `ReportType` - Report categories
- `ReportFrequency` - Report scheduling (DAILY, WEEKLY, MONTHLY)
- `RecommendationType` - Recommendation categories (PRODUCT, CROSS_SELL, UPSELL, PERSONALIZED)

### 2. Automation Modules

#### Order Automation (`order-automation.ts`)
**Triggers:**
- Order creation
- Order status changes

**Actions:**
- Send confirmation email with PDF invoice
- Notify admin via Telegram
- Generate and store invoice
- Log all status updates
- Send shipping notifications

**Architecture:**
```
Order Created → Queue Job → Email Service → Telegram Service → Invoice Generation → Log
```

#### Inventory Automation (`inventory-automation.ts`)
**Triggers:**
- Order confirmation
- Order cancellation/refund
- Scheduled low stock check

**Actions:**
- Decrease stock on order
- Restore stock on cancellation
- Detect low stock products
- Auto-mark products as out of stock
- Send low stock alerts via Telegram

**Architecture:**
```
Order → Stock Update → Low Stock Check → Telegram Alert → Auto Out-of-Stock → Log
```

#### Cart Recovery Automation (`cart-recovery.ts`)
**Triggers:**
- Cart abandonment (30 minutes inactivity)
- Scheduled reminders (24h, 72h)

**Actions:**
- Detect abandoned carts
- Send first reminder (24h, 10% discount)
- Send second reminder (72h, 15% discount)
- Track recovery status
- Generate recovery statistics

**Architecture:**
```
Cart Inactivity → Abandonment Detection → Schedule Reminder 1 → Schedule Reminder 2 → Track Recovery
```

#### Customer Automation (`customer-automation.ts`)
**Triggers:**
- User registration
- Order completion

**Actions:**
- Send welcome email with discount coupon
- Initialize loyalty points
- Classify customer segment
- Track lifetime value (LTV)
- Update loyalty tier

**Architecture:**
```
User Registered → Welcome Email + Coupon → Loyalty Init → Segment Classification
Order Completed → LTV Update → Tier Progression → Re-classification
```

#### Review Automation (`review-automation.ts`)
**Triggers:**
- Order delivery (7 days after)
- Manual review submission

**Actions:**
- Send review request email
- Prevent duplicate reviews
- Store product reviews
- Update product ratings
- Track review statistics

**Architecture:**
```
Order Delivered → 7 Days → Review Request → Email Sent → Response → Rating Update
```

#### Marketing Automation (`marketing-automation.ts`)
**Triggers:**
- User activity
- Cart contents
- Product views

**Actions:**
- Generate product recommendations
- Cross-sell suggestions
- Upsell recommendations
- Personalized offers
- Track recommendation performance

**Architecture:**
```
User Behavior → Purchase History → Browsing Data → Scoring Algorithm → Recommendations → Tracking
```

#### Reporting Automation (`reporting-automation.ts`)
**Triggers:**
- Scheduled (daily, weekly, monthly)
- Manual request

**Actions:**
- Generate sales reports
- Top products analysis
- Inactive products report
- PDF export
- Email delivery to recipients

**Architecture:**
```
Schedule Trigger → Report Generation → PDF Export → Email Delivery → Update Schedule
```

#### Loyalty Automation (`loyalty-automation.ts`)
**Triggers:**
- Order completion
- Points redemption

**Actions:**
- Calculate points earned
- Award points with tier bonuses
- Redeem points for discounts
- Track tier progression
- Generate loyalty statistics

**Architecture:**
```
Order → Points Calculation → Tier Bonus → Points Awarded → Tier Progression → Redemption
```

#### AI Features (`ai-features.ts`)
**Triggers:**
- Scheduled analysis
- Manual request

**Actions:**
- Sales insights dashboard
- Product performance analysis
- Customer behavior analysis
- Sales forecasting
- Inventory forecasting

**Architecture:**
```
Historical Data → Statistical Analysis → ML Models → Predictions → Dashboard
```

### 3. Queue System (BullMQ)

**Queue Types:**
- `emailQueue` - Email sending jobs
- `notificationQueue` - Notification jobs
- `automationQueue` - General automation jobs
- `inventoryQueue` - Inventory management jobs
- `reportQueue` - Report generation jobs

**Job Processing:**
- Async processing with workers
- Retry mechanism for failed jobs
- Priority-based job scheduling
- Dead letter queue for failed jobs

### 4. Cron Jobs (`cron-jobs.ts`)

**Schedule:**
- Every 30 minutes: Abandoned cart detection
- Every hour: Low stock detection
- Daily at 9 AM: Daily reports
- Daily at 10 AM: Review requests
- Weekly on Monday at 8 AM: Weekly reports
- Monthly on 1st at 8 AM: Monthly reports
- Every 6 hours: Inventory forecast
- Daily at 8 AM: Sales forecast

**Implementation:**
- Uses node-cron for scheduling
- Can be deployed as separate worker process
- Manual trigger support for testing
- Status monitoring and logging

### 5. Logging System (`logger.ts`)

**Log Types:**
- `logSuccess` - Successful automation execution
- `logFailure` - Failed automation with error details
- `logPending` - Automation initiated

**Log Data:**
- Organization ID
- Automation type
- Entity type and ID
- Action performed
- Status
- Metadata (JSON)
- Error message (if failed)
- Execution timestamp

**Query Functions:**
- `getAutomationLogs` - Logs for specific entity
- `getOrganizationAutomationLogs` - Organization-wide logs

## Data Flow

### Order Flow with Automation

```
1. Customer places order
   ↓
2. Order created in database
   ↓
3. Queue job: Order Automation
   ↓
4. Send confirmation email
   ↓
5. Generate PDF invoice
   ↓
6. Send Telegram notification to admin
   ↓
7. Queue job: Inventory Automation
   ↓
8. Decrease product stock
   ↓
9. Check for low stock
   ↓
10. Queue job: Customer Automation
    ↓
11. Update customer LTV
    ↓
12. Award loyalty points
    ↓
13. Check tier progression
    ↓
14. Log all actions
```

### Cart Recovery Flow

```
1. Customer adds items to cart
   ↓
2. 30 minutes of inactivity
   ↓
3. Cron job: Abandoned Cart Detection
   ↓
4. Create CartAbandonment record
   ↓
5. Schedule first reminder (24h)
   ↓
6. 24 hours later
   ↓
7. Send first reminder email (10% discount)
   ↓
8. 72 hours after abandonment
   ↓
9. Send second reminder email (15% discount)
   ↓
10. If customer completes purchase
    ↓
11. Mark cart as recovered
    ↓
12. Update recovery statistics
```

## Testing Strategy

### Unit Testing
- Test each automation function independently
- Mock external services (email, Telegram)
- Validate database operations
- Test error handling

### Integration Testing
- Test queue job processing
- Test cron job execution
- Test automation triggers
- Test end-to-end flows

### Performance Testing
- Load test queue processing
- Test concurrent automation execution
- Measure database query performance
- Test with high volume of data

### Monitoring
- Monitor queue backlog
- Track automation success/failure rates
- Alert on critical failures
- Log performance metrics

## Security Considerations

- All automation actions are logged
- Sensitive data is never logged
- Queue jobs are authenticated
- Rate limiting on automation triggers
- Input validation on all automation inputs
- Secure storage of API keys and secrets

## Scalability

### Horizontal Scaling
- Multiple queue workers can run in parallel
- Cron jobs can be distributed
- Database connection pooling
- Redis clustering for queue storage

### Vertical Scaling
- Optimize database queries
- Cache frequently accessed data
- Batch processing for bulk operations
- Lazy loading for large datasets

## Deployment

### Development
- Run cron jobs manually for testing
- Use local Redis for queue
- Enable debug logging
- Mock external services

### Production
- Deploy cron jobs as separate process
- Use managed Redis (e.g., Redis Cloud)
- Enable structured logging
- Monitor queue health
- Set up alerts for failures

## Maintenance

### Regular Tasks
- Review automation logs
- Clean up old logs (retention policy)
- Monitor queue performance
- Update automation rules as needed
- Review and optimize queries

### Troubleshooting
- Check AutomationLog for failures
- Monitor queue backlog
- Review worker logs
- Test automation triggers manually
- Verify cron job schedules

## Future Enhancements

- Webhook support for external integrations
- Custom automation rules builder
- Real-time automation dashboard
- Machine learning-powered predictions
- Advanced segmentation rules
- Multi-language support for emails
- SMS notifications
- Push notifications
- Advanced reporting with custom metrics
