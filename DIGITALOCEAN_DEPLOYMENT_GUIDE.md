# DigitalOcean Staging Deployment Guide

## What I Have Already Done ✅

### 1. Git Branch Created
- Created branch `staging-digitalocean` from main
- Pushed to GitHub: `https://github.com/mystore-stack/nexmart/tree/staging-digitalocean`

### 2. Docker Configuration Prepared
- Modified `Dockerfile` for DigitalOcean compatibility
  - Base image: `node:20-slim` with OpenSSL
  - Multi-stage build (deps → builder → runner)
  - Prisma client generation during build
  - Next.js standalone output
- Created `.dockerignore` to reduce build context
- Updated `next.config.js` with `output: 'standalone'`

### 3. DigitalOcean App Spec Created
- Created `.do/app.yaml` configuration file
- Configured health check path: `/api/health`
- Set instance size: `basic-xxs` (can be upgraded)
- Set HTTP port: 3000

### 4. Health Check Endpoint
- Created `src/app/api/health/route.ts`
- Checks database and Redis connectivity
- Returns JSON status for DigitalOcean health checks

### 5. Documentation
- Created `ROLLBACK_PROCEDURE.md` with rollback steps
- Created `STAGING_INFRASTRUCTURE_REPORT.md` with full infrastructure details
- Created `.env.staging.example` as template for environment variables

---

## What YOU Must Do in DigitalOcean

### Step 1: Connect GitHub to DigitalOcean
1. Log in to [DigitalOcean](https://cloud.digitalocean.com)
2. Go to **Apps** → **Create App**
3. Click **GitHub** → **Connect to GitHub**
4. Authorize DigitalOcean to access your repositories
5. Select repository: `mystore-stack/nexmart`
6. Select branch: `staging-digitalocean`

### Step 2: Configure the App
1. **Choose Resource Type**: Select "Dockerfile"
2. **Select Repository**: `mystore-stack/nexmart`
3. **Select Branch**: `staging-digitalocean`
4. **Dockerfile Path**: `Dockerfile` (root directory)
5. **Context**: `/` (root directory)

### Step 3: Configure Environment Variables
You must add these environment variables in DigitalOcean App Settings → Components → web → Settings → Env Vars:

**Critical Variables (Required):**
```
DATABASE_URL = [Your Neon PostgreSQL connection string]
NEXTAUTH_SECRET = [Generate a random 32+ character string]
NEXTAUTH_URL = [Your staging URL, e.g., https://nexmart-staging.onrender.com]
JWT_SECRET = [Generate a random 32+ character string]
JWT_REFRESH_SECRET = [Generate a random 32+ character string]
CRON_SECRET = [Generate a random 32+ character string]
```

**Database Variables:**
```
DATABASE_URL = postgresql://user:password@host/database?sslmode=require
DISABLE_REDIS = true
```

**Cloudinary Variables:**
```
CLOUDINARY_CLOUD_NAME = [Your Cloudinary cloud name]
CLOUDINARY_API_KEY = [Your Cloudinary API key]
CLOUDINARY_API_SECRET = [Your Cloudinary API secret]
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = [Your Cloudinary cloud name]
```

**NextAuth Variables:**
```
GOOGLE_CLIENT_ID = [Your Google OAuth client ID]
GOOGLE_CLIENT_SECRET = [Your Google OAuth client secret]
```

**Stripe Variables (for test mode):**
```
STRIPE_SECRET_KEY = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
```

**Email Variables:**
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = [Your SMTP username]
SMTP_PASS = [Your SMTP password]
EMAIL_FROM = noreply@nexmart.com
RESEND_API_KEY = re_...
RESEND_FROM_EMAIL = NexMart Maroc <noreply@nexmart.ma>
```

**Telegram Variables (optional):**
```
TELEGRAM_BOT_TOKEN = [Your bot token]
TELEGRAM_CHAT_ID = [Your chat ID]
```

**App Configuration:**
```
NODE_ENV = production
PORT = 3000
NEXT_PUBLIC_APP_URL = [Your staging URL]
NEXT_PUBLIC_APP_NAME = NexMart Staging
DEFAULT_ORGANIZATION_SLUG = nexmart
ADMIN_EMAIL = admin@nexmart.com
```

**Feature Flags:**
```
NEXT_PUBLIC_ENABLE_ANALYTICS = true
NEXT_PUBLIC_MAINTENANCE_MODE = false
NEXT_PUBLIC_ENABLE_AI_CHAT = true
NEXT_PUBLIC_ENABLE_AI_SEARCH = true
```

**JWT Settings:**
```
JWT_EXPIRES_IN = 15m
JWT_REFRESH_EXPIRES_IN = 7d
```

### Step 4: Configure App Settings
1. **Region**: Choose closest to your users (e.g., AMS, FRA, LON)
2. **Instance Size**: Start with `basic-xxs` ($5/month)
   - Can upgrade to `basic-xs` ($12/month) if needed
3. **HTTP Port**: 3000
4. **Health Check**:
   - Path: `/api/health`
   - Check interval: 30s
   - Timeout: 10s
   - Retries: 3
   - Initial delay: 40s

### Step 5: Configure Domain (Optional)
1. In DigitalOcean App → Settings → Domains
2. Add your staging domain (e.g., `staging.nexmart.ma`)
3. DigitalOcean will provide DNS records to add
4. Update your DNS provider with the records
5. Wait for DNS propagation (5-60 minutes)

**Alternative**: Use DigitalOcean's default URL (e.g., `nexmart-staging.ondigitalocean.app`)

### Step 6: Deploy
1. Click **Create Resources** or **Deploy**
2. Wait for build (5-15 minutes)
3. Monitor deployment logs in DigitalOcean console
4. Once deployed, note the staging URL

---

## Security Notes

### DO NOT:
- ❌ Paste production credentials into chat
- ❌ Commit `.env.staging` to Git
- ❌ Use production database for staging without isolation
- ❌ Expose secrets in logs or error messages

### DO:
- ✅ Use DigitalOcean's secure environment variable manager
- ✅ Generate new secrets for staging (separate from production)
- ✅ Use test-mode Stripe keys
- ✅ Restrict staging database access if possible
- ✅ Enable HTTPS (automatic on DigitalOcean)

---

## What I Can Do After Deployment

Once you provide the staging URL, I can:

1. **Test Health Check**
   - Verify `/api/health` returns 200
   - Check database connectivity
   - Verify Redis status

2. **Test Product Listing**
   - GET `/api/products`
   - Verify product data loads
   - Check Cloudinary images render

3. **Test Authentication**
   - Test registration endpoint
   - Test login endpoint
   - Verify session creation

4. **Test Cart Functionality**
   - Add items to cart
   - Update quantities
   - Remove items

5. **Test Checkout (Test Mode)**
   - Create test order
   - Verify Stripe test payment
   - Check order creation

6. **Test Admin CMS**
   - Login as admin
   - Test product management
   - Test homepage CMS

7. **Test Mobile API**
   - Test mobile login endpoint
   - Test mobile orders endpoint
   - Verify Bearer token authentication

8. **Verify Environment**
   - Check NODE_ENV is production
   - Verify NEXT_PUBLIC_APP_URL
   - Confirm database connection

---

## Monitoring Deployment

In DigitalOcean console, monitor:
- **Logs**: View real-time logs for errors
- **Metrics**: CPU, memory, disk usage
- **Deployments**: Build progress and history
- **Health Checks**: Health check status

---

## Troubleshooting

### Build Fails
- Check logs in DigitalOcean console
- Verify Dockerfile syntax
- Ensure all dependencies are in package.json
- Check for missing environment variables

### Health Check Fails
- Verify `/api/health` endpoint exists
- Check DATABASE_URL is correct
- Ensure database is accessible from DigitalOcean
- Verify port 3000 is exposed

### Database Connection Error
- Verify DATABASE_URL format
- Check Neon database is running
- Ensure SSL mode is enabled
- Verify IP whitelisting in Neon console

### Container Crashes
- Check logs for error messages
- Verify all required env vars are set
- Check memory limits (upgrade if needed)
- Verify Prisma client generation succeeded

---

## Post-Deployment Verification Checklist

After deployment, verify:

- [ ] Health check returns 200: `https://[staging-url]/api/health`
- [ ] Homepage loads: `https://[staging-url]/`
- [ ] Products API works: `https://[staging-url]/api/products`
- [ ] Product detail works: `https://[staging-url]/products/[slug]`
- [ ] Login page loads: `https://[staging-url]/login`
- [ ] Registration works
- [ ] Cart functionality works
- [ ] Admin dashboard accessible
- [ ] Images load from Cloudinary
- [ ] No console errors in browser
- [ ] Mobile API endpoints respond
- [ ] Database connectivity confirmed

---

## Cron Job Replacement

Vercel Cron jobs have been replaced with `scripts/cron-runner.sh`. To set up scheduled tasks:

### Option 1: DigitalOcean Cron Jobs (Not Available)
DigitalOcean App Platform does not support cron jobs natively.

### Option 2: External Cron Service
Use a service like:
- [CronJob.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [SetCron.io](https://www.setcron.com)

Configure to call:
```
curl -X POST https://[staging-url]/api/cron/abandoned-cart \
  -H "Authorization: Bearer [CRON_SECRET]"
```

### Option 3: GitHub Actions
Create `.github/workflows/cron.yml` to trigger cron endpoints via API calls.

---

## Cost Estimate

**DigitalOcean App Platform**:
- Basic XXS: $5/month (512MB RAM, 0.25 vCPU)
- Basic XS: $12/month (1GB RAM, 1 vCPU) - Recommended for staging
- Basic S: $24/month (2GB RAM, 1 vCPU)

**Additional Costs**:
- Neon database: Starting at $19/month (if using separate staging DB)
- Bandwidth: Included up to 1TB/month
- Storage: Included 10GB (SSD)

---

## Next Steps

1. **Deploy to DigitalOcean** using the steps above
2. **Provide the staging URL** once deployment completes
3. **I will test** all endpoints and functionality
4. **Report results** with actual URLs and test outcomes
5. **Adjust configuration** if any issues are found

---

## Production Cutover (Phase 2 - NOT YET)

Production cutover requires:
- ✅ Staging fully tested and verified
- ✅ Performance testing completed
- ✅ Security audit passed
- ✅ Database migration plan approved
- ✅ Backup verified
- ✅ Rollback procedure tested
- ✅ User approval obtained
- ✅ DNS change scheduled
- ✅ Mobile app updated with new API URL

**DO NOT proceed with production cutover without explicit approval.**

---

## Questions?

If you encounter any issues during DigitalOcean deployment:
1. Check the deployment logs in DigitalOcean console
2. Review this guide
3. Share the error message (without secrets)
4. I will help troubleshoot

---

**Current Status**: GitHub branch ready, awaiting DigitalOcean deployment
**Branch**: `staging-digitalocean`
**Repository**: https://github.com/mystore-stack/nexmart/tree/staging-digitalocean
