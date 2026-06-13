# Environment Variables Documentation

This document lists all environment variables required for the NexMart automation system.

## Core Application Variables

```bash
# Application
NEXT_PUBLIC_APP_URL=https://nexmart.ma
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nexmart

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Email Configuration

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="NexMart Maroc" <noreply@nexmart.ma>
```

## Telegram Bot Configuration

```bash
# Telegram Bot for Notifications
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Automation System Variables

```bash
# Automation Settings
AUTOMATION_ENABLED=true
AUTOMATION_LOG_LEVEL=info

# Cart Recovery
CART_ABANDONMENT_THRESHOLD_MINUTES=30
CART_REMINDER_1_HOURS=24
CART_REMINDER_2_HOURS=72

# Review Requests
REVIEW_REQUEST_DAYS_AFTER_DELIVERY=7

# Inventory
LOW_STOCK_ALERT_ENABLED=true
AUTO_OUT_OF_STOCK_ENABLED=true

# Loyalty Points
LOYALTY_POINTS_ENABLED=true
POINTS_PER_DH=1
POINTS_REDEMPTION_RATE=100

# Reports
REPORTS_ENABLED=true
REPORT_TIMEZONE=Africa/Casablanca

# AI Features
AI_FEATURES_ENABLED=true
FORECASTING_ENABLED=true
```

## Queue Configuration

```bash
# BullMQ Configuration
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=

# Queue Settings
EMAIL_QUEUE_CONCURRENCY=5
NOTIFICATION_QUEUE_CONCURRENCY=10
AUTOMATION_QUEUE_CONCURRENCY=3
```

## Cron Job Configuration

```bash
# Cron Schedules
CRON_ABANDONED_CART_DETECTION="*/30 * * * *"
CRON_LOW_STOCK_DETECTION="0 * * * *"
CRON_DAILY_REPORTS="0 9 * * *"
CRON_REVIEW_REQUESTS="0 10 * * *"
CRON_WEEKLY_REPORTS="0 8 * * 1"
CRON_MONTHLY_REPORTS="0 8 1 * *"
CRON_INVENTORY_FORECAST="0 */6 * * *"
CRON_SALES_FORECAST="0 8 * * *"
```

## Development Variables

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DEBUG=true
LOG_LEVEL=debug

# Testing
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/nexmart_test
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, randomly generated secrets for JWT keys
- Rotate secrets regularly in production
- Use environment-specific configurations
- Enable HTTPS in production
- Use secure SMTP connections (TLS/SSL)
- Keep Telegram bot tokens secure

## Required vs Optional Variables

### Required
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Optional (with defaults)
- `REDIS_HOST` (default: localhost)
- `REDIS_PORT` (default: 6379)
- `SMTP_HOST` (default: smtp.gmail.com)
- `SMTP_PORT` (default: 587)
- `AUTOMATION_ENABLED` (default: true)
- `LOYALTY_POINTS_ENABLED` (default: true)

## Setup Instructions

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Fill in all required values

3. Start the application:
```bash
npm run dev
```

4. For production, ensure all required variables are set in your hosting environment
