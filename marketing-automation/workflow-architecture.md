# n8n Workflow Architecture for NexMart Marketing Automation

## Overview
This document describes the complete n8n workflow architecture for the NexMart ecommerce marketing automation system. The system is designed to handle 100,000+ customers and 10,000+ orders per month with high availability and production-grade reliability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         n8n Instance                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Trigger     │───▶│  Process     │───▶│  Action      │      │
│  │  Nodes       │    │  Nodes       │    │  Nodes       │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Schedule    │    │  Condition   │    │  Email Send  │      │
│  │  Webhook     │    │  Transform   │    │  Telegram    │      │
│  │  Database    │    │  AI Generate │    │  Facebook    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   PostgreSQL   │  │     Redis      │  │  External APIs │
│   Database     │  │   Cache/Dedup  │  │  (Gmail, FB,   │
│                │  │                │  │   Telegram,    │
└────────────────┘  └────────────────┘  │   OpenAI, etc) │
                                        └────────────────┘
```

## Workflow Categories

### 1. Cart Recovery Workflows
- **Abandoned Cart Recovery** - Multi-stage email sequence for abandoned carts
- **Cart Activity Tracking** - Real-time cart activity monitoring

### 2. Order Management Workflows
- **Order Confirmation** - Instant order confirmation emails
- **Shipping Updates** - Automated shipping status notifications
- **Delivery Confirmation** - Post-delivery review requests

### 3. Customer Engagement Workflows
- **Customer Winback** - Re-engagement for inactive customers
- **VIP Customer** - Special treatment for high-value customers
- **Product Reviews** - Automated review collection

### 4. Inventory Management Workflows
- **Low Stock Alerts** - Real-time stock level monitoring
- **Back in Stock** - Notifications when products are restocked

### 5. Marketing & Analytics Workflows
- **Facebook Conversion API** - Event tracking for ads optimization
- **Google Sheets CRM** - Data synchronization
- **AI Marketing** - AI-generated content and campaigns
- **Daily Business Report** - Automated daily metrics
- **Weekly CEO Report** - Comprehensive weekly analysis

## Workflow Specifications

### Workflow 1: Abandoned Cart Recovery
**Trigger:** Schedule (every 15 minutes)
**Frequency:** 3 emails over 24 hours
**Stages:**
- 30 minutes: "You left something behind 👀"
- 6 hours: "Your cart is waiting"
- 24 hours: "Last chance before stock runs out" + 5% coupon

**Nodes:**
1. Schedule Trigger (Cron: */15 * * * *)
2. PostgreSQL Query (Find abandoned carts)
3. Redis Check (Deduplication)
4. Function (Calculate cart value)
5. Condition (Check recovery stage)
6. Email Send (Stage 1)
7. Wait (5h 30m)
8. Email Send (Stage 2)
9. Wait (18h)
10. Email Send (Stage 3)
11. Coupon Generation (if enabled)
12. PostgreSQL Update (Mark as sent)
13. Redis Set (Deduplication key)

### Workflow 2: Order Confirmation
**Trigger:** Webhook (POST /api/orders)
**Frequency:** Real-time
**Channels:** Email + Telegram

**Nodes:**
1. Webhook Trigger
2. PostgreSQL Query (Get order details)
3. PostgreSQL Query (Get customer details)
4. PostgreSQL Query (Get order items)
5. Function (Format order data)
6. Email Send (Order confirmation)
7. Telegram Send (Admin notification)
8. PostgreSQL Insert (Log notification)
9. Redis Set (Deduplication)

### Workflow 3: Shipping Automation
**Trigger:** Webhook (Order status change)
**Frequency:** Real-time
**Stages:** Processing → Shipped → Delivered

**Nodes:**
1. Webhook Trigger
2. Condition (Check status)
3. Branch (Processing/Shipped/Delivered)
4. Email Send (Processing notification)
5. Email Send (Shipped notification with tracking)
6. Email Send (Delivered + review request)
7. PostgreSQL Update (Update notification log)
8. Redis Set (Deduplication)

### Workflow 4: Customer Winback
**Trigger:** Schedule (daily at 09:00)
**Frequency:** Once per customer
**Target:** Customers with no orders in 30 days

**Nodes:**
1. Schedule Trigger (Cron: 0 9 * * *)
2. PostgreSQL Query (Find inactive customers)
3. Redis Check (Deduplication)
4. Function (Calculate recommendations)
5. AI Generate (Personalized content)
6. Email Send (Winback campaign)
7. PostgreSQL Update (Mark as sent)
8. Redis Set (Deduplication)

### Workflow 5: VIP Customer Automation
**Trigger:** Database event (Customer LTV > 3000 MAD)
**Frequency:** Real-time
**Actions:** Tag as VIP, special email, exclusive coupon

**Nodes:**
1. PostgreSQL Trigger
2. PostgreSQL Query (Get customer details)
3. Function (Check LTV)
4. Condition (LTV > 3000)
5. PostgreSQL Update (Set VIP tag)
6. Coupon Generation (Exclusive coupon)
7. Email Send (VIP welcome)
8. Telegram Send (VIP alert)
9. Redis Set (VIP cache)

### Workflow 6: Product Review Automation
**Trigger:** Schedule (daily at 10:00)
**Frequency:** 7 days after delivery
**Target:** Delivered orders without reviews

**Nodes:**
1. Schedule Trigger (Cron: 0 10 * * *)
2. PostgreSQL Query (Find delivered orders 7 days ago)
3. PostgreSQL Query (Check for existing reviews)
4. Condition (No review exists)
5. Function (Get product details)
6. Email Send (Review request)
7. PostgreSQL Update (Mark review request sent)
8. Redis Set (Deduplication)

### Workflow 7: Low Stock Alert
**Trigger:** Schedule (every 5 minutes)
**Frequency:** Real-time monitoring
**Threshold:** Stock < 5

**Nodes:**
1. Schedule Trigger (Cron: */5 * * * *)
2. PostgreSQL Query (Find products with low stock)
3. Redis Check (Alert already sent?)
4. Function (Format alert message)
5. Telegram Send (Low stock alert)
6. Email Send (Low stock alert)
7. Redis Set (Alert sent flag)
8. PostgreSQL Insert (Log alert)

### Workflow 8: Facebook Conversion API
**Trigger:** Webhook (User events)
**Events:** ViewContent, AddToCart, InitiateCheckout, Purchase
**Frequency:** Real-time

**Nodes:**
1. Webhook Trigger
2. Function (Extract event data)
3. Redis Check (Deduplication)
4. Function (Format for Facebook CAPI)
5. HTTP Request (Send to Facebook)
6. Function (Handle response)
7. PostgreSQL Insert (Log event)
8. Redis Set (Deduplication)

### Workflow 9: Google Sheets CRM Sync
**Trigger:** Schedule (hourly)
**Frequency:** Every hour
**Data:** Customers, Orders, Revenue, Coupons, Abandoned carts

**Nodes:**
1. Schedule Trigger (Cron: 0 * * * *)
2. Redis Check (Sync lock)
3. PostgreSQL Query (Get customers)
4. Google Sheets (Update customers sheet)
5. PostgreSQL Query (Get orders)
6. Google Sheets (Update orders sheet)
7. PostgreSQL Query (Get revenue data)
8. Google Sheets (Update revenue sheet)
9. PostgreSQL Query (Get coupons)
10. Google Sheets (Update coupons sheet)
11. PostgreSQL Query (Get abandoned carts)
12. Google Sheets (Update abandoned carts sheet)
13. Redis Delete (Sync lock)

### Workflow 10: AI Marketing Automation
**Trigger:** Schedule (daily at 08:00)
**Frequency:** Daily
**Tasks:** Generate email subjects, content, campaigns

**Nodes:**
1. Schedule Trigger (Cron: 0 8 * * *)
2. PostgreSQL Query (Get products)
3. Function (Select products for promotion)
4. OpenAI (Generate email subjects)
5. OpenAI (Generate email content)
6. OpenAI (Generate promotional copy)
7. PostgreSQL Insert (Save generated content)
8. Redis Set (Cache content)

### Workflow 11: Daily Business Report
**Trigger:** Schedule (daily at 08:00)
**Frequency:** Daily
**Metrics:** Revenue, Orders, Top Products, Conversion Rate, Abandoned Carts, AOV

**Nodes:**
1. Schedule Trigger (Cron: 0 8 * * *)
2. Redis Check (Report already generated?)
3. PostgreSQL Query (Get today's revenue)
4. PostgreSQL Query (Get today's orders)
5. PostgreSQL Query (Get top products)
6. PostgreSQL Query (Get conversion rate)
7. PostgreSQL Query (Get abandoned carts)
8. PostgreSQL Query (Get average order value)
9. Function (Format report)
10. Telegram Send (Daily report)
11. Email Send (Daily report)
12. Redis Set (Report cache)

### Workflow 12: Weekly CEO Report
**Trigger:** Schedule (Monday at 09:00)
**Frequency:** Weekly
**Metrics:** Revenue, Growth %, Best sellers, Worst sellers, Customer acquisition, Return customers

**Nodes:**
1. Schedule Trigger (Cron: 0 9 * * 1)
2. Redis Check (Report already generated?)
3. PostgreSQL Query (Get weekly revenue)
4. PostgreSQL Query (Get growth percentage)
5. PostgreSQL Query (Get best sellers)
6. PostgreSQL Query (Get worst sellers)
7. PostgreSQL Query (Get customer acquisition)
8. PostgreSQL Query (Get return customer rate)
9. Function (Format report)
10. AI Generate (Executive summary)
11. Email Send (Weekly report)
12. Telegram Send (Weekly report)
13. Redis Set (Report cache)

## Error Handling Strategy

### Retry Logic
- **Max retries:** 5 attempts
- **Backoff strategy:** Exponential backoff (1s, 2s, 4s, 8s, 16s)
- **Dead letter queue:** Failed operations moved to DLQ after max retries

### Error Categories
1. **Transient errors:** Network issues, temporary API failures (retry)
2. **Permanent errors:** Invalid data, configuration errors (log to DLQ)
3. **Rate limit errors:** Back off and retry with delay
4. **Authentication errors:** Alert admin, pause workflow

### Monitoring
- **Workflow execution logs:** All executions logged to PostgreSQL
- **Error alerts:** Telegram notifications for critical errors
- **Performance metrics:** Track execution time and success rate
- **Health checks:** Monitor n8n instance health

## Security Considerations

### Credentials Management
- Store all credentials in n8n credentials manager
- Use environment variables for sensitive data
- Rotate credentials regularly
- Use API keys with minimal permissions

### Data Privacy
- Anonymize customer data in logs
- Comply with GDPR/Moroccan data protection laws
- Encrypt sensitive data at rest and in transit
- Implement data retention policies

### Access Control
- Role-based access control for n8n
- IP whitelisting for webhook endpoints
- Audit logging for all workflow modifications

## Performance Optimization

### Database Optimization
- Use connection pooling (50-100 connections)
- Implement database indexes for frequent queries
- Use read replicas for reporting queries
- Cache frequently accessed data in Redis

### Redis Optimization
- Set appropriate TTL for all keys
- Use Redis Cluster for high availability
- Monitor memory usage and set maxmemory policy
- Use connection pooling

### n8n Optimization
- Use queue mode for high-throughput workflows
- Implement workflow concurrency limits
- Use function nodes for complex transformations
- Batch operations where possible

## Scaling Strategy

### Horizontal Scaling
- Deploy multiple n8n instances behind a load balancer
- Use Redis for distributed locking
- Implement queue mode for workflow execution
- Use PostgreSQL as shared database

### Vertical Scaling
- Allocate sufficient CPU (8+ cores for production)
- Allocate sufficient memory (16GB+ for production)
- Use SSD storage for database
- Monitor resource usage and scale accordingly

## Deployment Architecture

### Production Setup
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              n8n Instance 1 (Primary)                   │
│              n8n Instance 2 (Secondary)                 │
│              n8n Instance 3 (Tertiary)                  │
└─────────────────────────────────────────────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   PostgreSQL   │  │     Redis      │  │  External APIs │
│   (Primary)    │  │   (Primary)    │  │                │
│   PostgreSQL   │  │   Redis        │  │                │
│   (Replica)    │  │   (Replica)    │  │                │
└────────────────┘  └────────────────┘  └────────────────┘
```

### High Availability
- PostgreSQL: Master-slave replication with automatic failover
- Redis: Master-slave replication with Sentinel
- n8n: Multiple instances with queue mode
- External APIs: Implement circuit breakers and fallbacks

## Monitoring & Alerting

### Key Metrics to Monitor
- Workflow execution success rate
- Average workflow execution time
- Error rate by workflow
- Database query performance
- Redis memory usage
- API rate limits
- Email delivery rate
- Telegram message delivery

### Alert Thresholds
- Error rate > 5%: Alert via Telegram
- Workflow execution time > 30s: Alert via Telegram
- Database connection pool exhaustion: Alert via Telegram
- Redis memory usage > 80%: Alert via Telegram
- API rate limit exceeded: Alert via Telegram

## Maintenance

### Regular Tasks
- Daily: Review error logs and DLQ
- Weekly: Review workflow performance metrics
- Monthly: Review and optimize slow queries
- Quarterly: Review and update workflows
- Annually: Security audit and credential rotation

### Backup Strategy
- PostgreSQL: Daily backups with 30-day retention
- Redis: Daily snapshots with 7-day retention
- n8n workflows: Export and version control
- Configuration files: Version control

## Workflow Dependencies

### External Services Required
- **Gmail SMTP:** Email delivery
- **Telegram Bot API:** Admin notifications
- **Facebook Conversion API:** Event tracking
- **OpenAI API:** AI content generation
- **Google Sheets API:** CRM sync

### Internal Services Required
- **PostgreSQL:** Database
- **Redis:** Cache and deduplication
- **Next.js API:** Webhook endpoints

## Workflow Priority

### Critical (Must Run)
- Order Confirmation
- Shipping Automation
- Low Stock Alerts

### High Priority
- Abandoned Cart Recovery
- Facebook Conversion API
- Daily Business Report

### Medium Priority
- Customer Winback
- VIP Customer Automation
- Product Review Automation
- Google Sheets CRM Sync

### Low Priority
- AI Marketing Automation
- Weekly CEO Report

## Testing Strategy

### Unit Testing
- Test individual nodes in isolation
- Mock external API calls
- Test error handling logic

### Integration Testing
- Test complete workflows
- Test with real database
- Test with real Redis

### Load Testing
- Test with 10,000+ concurrent executions
- Test database performance under load
- Test Redis performance under load

### Disaster Recovery Testing
- Test failover to secondary database
- Test failover to secondary Redis
- Test workflow recovery after n8n restart
