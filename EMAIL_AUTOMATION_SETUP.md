# Email Automation System Setup Guide

## Overview
This document describes the production-ready email automation system implemented for NexMart, including welcome emails, order confirmations, stock alerts, abandoned cart recovery, and daily sales reports.

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Resend Email Service
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=NexMart Maroc <noreply@nexmart.ma>

# Admin Email for Notifications
ADMIN_EMAIL=admin@nexmart.ma

# Cron Job Security
CRON_SECRET=your_secure_random_secret_here

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=https://nexmart.ma
```

## Database Migration

The migration has been applied successfully. The following new models were added:

- `EmailLog` - Tracks all email sends with status, retries, and delivery metrics
- `CartReminder` - Manages abandoned cart recovery with 3-email sequence
- `StockAlertLog` - Tracks low stock alerts and acknowledgments
- `DailySalesReport` - Stores daily sales metrics and report history

## Email Templates

All email templates are located in `src/lib/email-templates.ts` with Moroccan luxury branding:
- Welcome email with benefits showcase
- Order confirmation with itemized details
- Stock alert with product information
- Cart abandonment with recovery incentives
- Daily sales report with key metrics

## Vercel Cron Jobs

Configure the following cron jobs in your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-sales-report",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/abandoned-cart",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/low-stock-check",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## API Endpoints

### Automation Statistics
- `GET /api/admin/automation/stats` - Get overall automation metrics

### Stock Alerts
- `GET /api/admin/automation/stock-alerts` - List stock alerts
- `POST /api/admin/automation/stock-alerts` - Acknowledge/resolve alerts

### Daily Reports
- `GET /api/admin/automation/daily-reports` - View daily sales reports

## Features Implemented

### Phase 1: Database Changes ✅
- Added EmailLog, CartReminder, StockAlertLog, DailySalesReport models
- Added EmailType and EmailStatus enums
- Created proper relations and indexes

### Phase 2: Email Infrastructure ✅
- Integrated Resend for email delivery
- Created reusable email templates
- Implemented retry logic with exponential backoff
- Added comprehensive error handling and logging

### Phase 3: Welcome Emails ✅
- Automatic welcome email on user registration
- Non-blocking async email sending
- Database logging for tracking

### Phase 4: Order Confirmation ✅
- Order confirmation email with full details
- Itemized order summary
- Shipping address included
- Sent immediately after order creation

### Phase 5: Stock Alerts ✅
- Low stock detection system
- Configurable threshold per product
- Admin notification via email
- Alert acknowledgment and resolution tracking

### Phase 6: Abandoned Cart ✅
- 3-email recovery sequence (24h, 72h, 7 days)
- Cart value and item count tracking
- Recovery rate analytics
- Automatic cart recovery detection

### Phase 7: Daily Reports ✅
- Daily sales report generation
- Revenue, orders, new customers metrics
- Top products tracking
- Payment method breakdown
- Order status distribution

### Phase 8: Vercel Cron Jobs ✅
- Daily sales report cron (midnight UTC)
- Abandoned cart check (every 6 hours)
- Low stock check (daily at 9 AM)
- Secure with CRON_SECRET

### Phase 9: Admin Dashboard ✅
- Automation statistics API
- Stock alerts management API
- Daily reports viewing API
- Email metrics tracking

### Phase 10: Testing & Deployment ✅
- Database migration applied
- Prisma Client regenerated
- Environment variables documented
- Seed data verified

## Testing

To test the email system:

1. **Welcome Email**: Register a new user account
2. **Order Confirmation**: Create a test order
3. **Stock Alerts**: Set a product stock below threshold
4. **Abandoned Cart**: Add items to cart and wait 24 hours
5. **Daily Reports**: Wait for midnight UTC or trigger cron manually

## Production Checklist

- [ ] Set up Resend account and get API key
- [ ] Configure RESEND_FROM_EMAIL with verified domain
- [ ] Set ADMIN_EMAIL for notifications
- [ ] Generate secure CRON_SECRET
- [ ] Update NEXT_PUBLIC_APP_URL to production domain
- [ ] Configure Vercel cron jobs
- [ ] Test all email templates in production
- [ ] Monitor EmailLog for delivery issues
- [ ] Set up alerting for failed emails
- [ ] Review and adjust stock thresholds
- [ ] Configure abandoned cart timing as needed

## Monitoring

Monitor the following metrics via the admin dashboard:
- Email delivery rate
- Cart recovery rate
- Stock alert response time
- Daily report generation success

## Troubleshooting

### Emails not sending
- Check RESEND_API_KEY is valid
- Verify RESEND_FROM_EMAIL domain is verified in Resend
- Check EmailLog table for error messages

### Cron jobs failing
- Verify CRON_SECRET matches between code and Vercel
- Check Vercel cron job logs
- Ensure API routes are accessible

### Stock alerts not triggering
- Verify product lowStockAt threshold is set
- Check StockAlertLog for recent alerts
- Ensure admin email is configured
