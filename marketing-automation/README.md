# NexMart Marketing Automation System

Complete Ecommerce Marketing Automation System using n8n for NexMart, designed to handle 100,000+ customers and 10,000+ orders/month with high availability and production-grade reliability.

## 📋 Overview

This system provides a fully automated growth engine similar to Shopify Plus stores, with comprehensive marketing automation workflows, real-time monitoring, and production-grade error handling.

## 🎯 Features

### Cart Recovery
- **3-stage abandoned cart recovery** (30 min, 6 hours, 24 hours)
- Dynamic coupon generation (5% off)
- Redis deduplication to prevent duplicates
- Personalized email content

### Order Management
- **Instant order confirmation** via email + Telegram
- **Shipping status updates** (Processing → Shipped → Delivered)
- Automated tracking notifications
- Review request automation (7 days post-delivery)

### Customer Engagement
- **Customer winback** for inactive customers (30+ days)
- **VIP customer automation** (LTV > 3000 MAD)
- Personalized AI-generated content
- Exclusive coupons and early access

### Inventory Management
- **Real-time low stock alerts** (stock < 5)
- Telegram + email notifications
- Automatic inventory monitoring

### Marketing & Analytics
- **Facebook Conversion API** integration (ViewContent, AddToCart, Purchase)
- **Google Sheets CRM** sync (Customers, Orders, Revenue, Coupons)
- **AI-powered marketing** (email subjects, content, social posts)
- **Daily business reports** (Revenue, Orders, Conversion Rate, AOV)
- **Weekly CEO reports** (Growth, Best/Worst sellers, Customer metrics)

## 📁 Project Structure

```
marketing-automation/
├── workflows/                          # n8n workflow JSON files
│   ├── abandoned-cart-recovery.json    # Abandoned cart recovery (3-stage)
│   ├── order-confirmation.json         # Order confirmation automation
│   ├── shipping-automation.json       # Shipping status updates
│   ├── low-stock-alert.json            # Low stock monitoring
│   ├── customer-winback.json          # Customer winback campaign
│   ├── vip-customer.json              # VIP customer automation
│   ├── product-review.json            # Product review requests
│   ├── facebook-conversion-api.json   # Facebook CAPI integration
│   ├── google-sheets-crm.json        # Google Sheets sync
│   ├── ai-marketing.json             # AI content generation
│   ├── daily-business-report.json    # Daily metrics report
│   └── weekly-ceo-report.json        # Weekly executive report
├── integrations/                       # Integration setup guides
│   ├── telegram-setup.md             # Telegram bot configuration
│   └── gmail-smtp-setup.md           # Gmail SMTP configuration
├── postgresql-schema-extension.prisma # Database schema extensions
├── redis-structure.md                 # Redis key patterns and usage
├── workflow-architecture.md           # Complete workflow architecture
├── error-handling-strategy.md         # Error handling and retry logic
├── production-deployment-guide.md    # Production deployment instructions
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites
- n8n instance (Docker or self-hosted)
- PostgreSQL 14+
- Redis 7+
- Gmail account with 2FA
- Telegram bot
- OpenAI API key (for AI features)
- Facebook Pixel (for CAPI)
- Google Sheets (for CRM sync)

### Installation

1. **Database Setup**
```bash
# Merge schema extensions with existing Prisma schema
cat marketing-automation/postgresql-schema-extension.prisma >> prisma/schema.prisma

# Run migrations
npx prisma migrate dev
npx prisma db push
```

2. **Import Workflows**
```bash
# Import all workflows to n8n
for workflow in marketing-automation/workflows/*.json; do
  curl -X POST \
    -H "Content-Type: application/json" \
    -d @$workflow \
    http://localhost:5678/rest/workflows/import
done
```

3. **Configure Credentials**
- Follow `integrations/telegram-setup.md` for Telegram
- Follow `integrations/gmail-smtp-setup.md` for Gmail SMTP
- Configure PostgreSQL, Redis, OpenAI, Facebook, and Google Sheets credentials in n8n

4. **Set Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/nexmart
REDIS_URL=redis://host:6379

# n8n
N8N_ENCRYPTION_KEY=your_32_character_encryption_key
EXECUTIONS_MODE=queue
QUEUE_BULL_REDIS=redis://host:6379

# Integrations
TELEGRAM_ADMIN_CHAT_ID=your_chat_id
TELEGRAM_BOT_TOKEN=your_bot_token
GMAIL_SMTP_USER=your-email@gmail.com
GMAIL_SMTP_PASSWORD=your_app_password
OPENAI_API_KEY=your_openai_key
FACEBOOK_ACCESS_TOKEN=your_fb_token
FACEBOOK_PIXEL_ID=your_pixel_id
GOOGLE_SHEET_ID=your_sheet_id
```

## 📊 Workflow Specifications

### Abandoned Cart Recovery
- **Trigger**: Every 15 minutes
- **Stages**: 30 min → 6 hours → 24 hours
- **Features**: 3 emails, 5% coupon, Redis deduplication

### Order Confirmation
- **Trigger**: Webhook (POST /api/orders)
- **Channels**: Email + Telegram
- **Features**: Order details, tracking link, admin notification

### Shipping Automation
- **Trigger**: Webhook (Order status change)
- **Stages**: Processing → Shipped → Delivered
- **Features**: Status-specific emails, review request

### Customer Winback
- **Trigger**: Daily at 09:00
- **Target**: Customers with no orders in 30 days
- **Features**: AI-generated content, 10% coupon

### VIP Customer
- **Trigger**: LTV > 3000 MAD
- **Features**: VIP tagging, 15% exclusive coupon, early access

### Product Reviews
- **Trigger**: Daily at 10:00
- **Target**: 7 days after delivery
- **Features**: Review request email, product images

### Low Stock Alert
- **Trigger**: Every 5 minutes
- **Threshold**: Stock < 5
- **Features**: Telegram + email alerts, Redis deduplication

### Facebook CAPI
- **Trigger**: Webhook (User events)
- **Events**: ViewContent, AddToCart, InitiateCheckout, Purchase
- **Features**: Event deduplication, logging

### Google Sheets CRM
- **Trigger**: Hourly
- **Data**: Customers, Orders, Revenue, Coupons, Abandoned carts
- **Features**: Sync lock, Redis caching

### AI Marketing
- **Trigger**: Daily at 08:00
- **Features**: Email subjects, content, social posts, product descriptions

### Daily Business Report
- **Trigger**: Daily at 08:00
- **Metrics**: Revenue, Orders, Top Products, Conversion Rate, AOV
- **Channels**: Telegram + Email

### Weekly CEO Report
- **Trigger**: Monday at 09:00
- **Metrics**: Revenue, Growth, Best/Worst sellers, Customer metrics
- **Features**: AI executive summary, Telegram + Email

## 🔧 Configuration

### PostgreSQL Schema
The system extends the existing NexMart schema with marketing automation models:
- MarketingCampaign
- MarketingAutomation
- AutomationExecution
- AbandonedCartRecovery
- CustomerSegment
- EmailTemplate
- FacebookConversionEvent
- MarketingCoupon
- MarketingMetric

See `postgresql-schema-extension.prisma` for complete schema.

### Redis Structure
Redis is used for deduplication, caching, and rate limiting:
- Email deduplication: `email:sent:{userId}:{type}:{hash}` (TTL: 7 days)
- SMS deduplication: `sms:sent:{userId}:{type}:{hash}` (TTL: 24 hours)
- Cart activity: `cart:activity:{userId}` (TTL: 48 hours)
- Report cache: `report:daily:{date}` (TTL: 2 hours)

See `redis-structure.md` for complete key patterns.

## 🛡️ Error Handling

The system implements comprehensive error handling:
- **Retry Logic**: Exponential backoff (max 5 retries)
- **Dead Letter Queue**: Store failed operations for manual review
- **Circuit Breaker**: Prevent cascading failures
- **Redis Deduplication**: Prevent duplicate operations
- **Monitoring**: Real-time alerts via Telegram

See `error-handling-strategy.md` for complete strategy.

## 🚢 Production Deployment

### Infrastructure Requirements
- **CPU**: 8+ cores per n8n instance
- **Memory**: 16GB+ per n8n instance
- **Storage**: 100GB+ SSD for database
- **Network**: 1Gbps+ bandwidth

### High Availability Setup
- PostgreSQL: Master-slave replication
- Redis: Master-slave with Sentinel
- n8n: 3 instances (1 primary + 2 workers) with queue mode
- Load Balancer: Nginx/HAProxy

See `production-deployment-guide.md` for complete deployment instructions.

## 📈 Monitoring

### Key Metrics
- Workflow execution success rate
- Average execution time
- Error rate by workflow
- Database query performance
- Redis memory usage
- Email delivery rate
- API rate limits

### Alerting
- Error rate > 10%: Critical alert
- DLQ size > 100: Critical alert
- Database connection pool exhaustion: Critical alert
- Redis memory > 80%: Warning alert

## 🔐 Security

### Best Practices
- All credentials stored in n8n credential manager
- Environment variables for sensitive data
- SSL/TLS for all communications
- Rate limiting for API calls
- Input validation and sanitization
- Regular security audits

### Data Privacy
- Comply with GDPR/Moroccan data protection laws
- Anonymize customer data in logs
- Implement data retention policies
- Secure data at rest and in transit

## 📚 Documentation

- **Workflow Architecture**: `workflow-architecture.md`
- **PostgreSQL Schema**: `postgresql-schema-extension.prisma`
- **Redis Structure**: `redis-structure.md`
- **Telegram Setup**: `integrations/telegram-setup.md`
- **Gmail SMTP Setup**: `integrations/gmail-smtp-setup.md`
- **Error Handling**: `error-handling-strategy.md`
- **Production Deployment**: `production-deployment-guide.md`

## 🎯 Performance

### Scalability
- Supports 100,000+ customers
- Handles 10,000+ orders/month
- High availability with queue mode
- Horizontal scaling with worker instances

### Optimization
- Database connection pooling (50-100 connections)
- Redis caching with appropriate TTLs
- Queue mode for high-throughput workflows
- Batch operations where possible

## 🤝 Support

For issues or questions:
1. Check the documentation in the `marketing-automation/` directory
2. Review error logs in n8n
3. Check PostgreSQL and Redis logs
4. Monitor Telegram alerts for critical issues

## 📝 License

This marketing automation system is part of the NexMart project.

## 🎉 Summary

This complete marketing automation system provides:
- **12 production-ready n8n workflows**
- **Comprehensive database schema extensions**
- **Redis deduplication and caching strategy**
- **Integration guides for all external services**
- **Production-grade error handling**
- **Complete deployment documentation**

The system is designed for high availability, scalability, and production-grade reliability, capable of handling 100,000+ customers and 10,000+ orders per month.
