# Phase 2: DigitalOcean Staging Deployment Instructions

**Status**: Phase 1 Complete ✅ | Phase 2 In Progress ⏳
**Branch**: staging-digitalocean
**GitHub**: https://github.com/mystore-stack/nexmart/tree/staging-digitalocean

---

## What I Have Completed in Phase 2

### 1. Security Audit ✅
- Created `PHASE1_SECURITY_AUDIT.md` with complete security analysis
- Identified all Vercel-specific dependencies
- Listed all cron jobs requiring external scheduler
- Documented credential rotation recommendations
- No critical blockers found

### 2. Vercel Dependency Replacements ✅
- **CORS Headers**: Added to `next.config.js` (replaces Vercel headers)
- **Timeout Middleware**: Created `src/middleware.ts` for API timeout warnings
- **Environment Variables**: Configured in `.do/app.yaml` with all required vars

### 3. DigitalOcean Configuration ✅
- Updated `.do/app.yaml` with complete environment variable list
- All variables marked as `scope: RUN_TIME` for security
- Health check configured: `/api/health`
- Instance size: `basic-xxs` (upgradable)
- Port: 3000

### 4. Git Repository ✅
- All changes committed and pushed to `staging-digitalocean` branch
- Repository ready for DigitalOcean import

---

## What YOU Must Do in DigitalOcean

### Step 1: Log in to DigitalOcean
1. Go to https://cloud.digitalocean.com
2. Log in with your account
3. Navigate to **Apps** → **Create App**

### Step 2: Connect GitHub Repository
1. Click **GitHub** under "Source"
2. Click **Connect to GitHub**
3. Authorize DigitalOcean to access your repositories
4. Search for: `mystore-stack/nexmart`
5. Select the repository
6. Select branch: `staging-digitalocean`

### Step 3: Configure App Source
1. **Resource Type**: Dockerfile
2. **Repository**: mystore-stack/nexmart
3. **Branch**: staging-digitalocean
4. **Dockerfile Path**: Dockerfile (root directory)
5. **Context**: `/` (root directory)
6. Click **Next**

### Step 4: Configure App Settings
1. **Name**: nexmart-staging (or your preferred name)
2. **Region**: Choose closest to your users:
   - AMS (Amsterdam) - Good for Europe
   - FRA (Frankfurt) - Good for Europe
   - LON (London) - Good for UK/Europe
3. **Instance Size**: Start with `basic-xxs` ($5/month)
   - 512MB RAM, 0.25 vCPU
   - Can upgrade later if needed
4. **HTTP Port**: 3000
5. Click **Next**

### Step 5: Configure Environment Variables (CRITICAL)

DigitalOcean will automatically import the variables from `.do/app.yaml`, but you MUST provide the actual values. Go to **Settings** → **Components** → **web** → **Settings** → **Env Vars** and add these values:

#### Required Variables (Must Set):
```
DATABASE_URL = [Your Neon PostgreSQL connection string]
NEXTAUTH_SECRET = [Generate a random 32+ character string]
NEXTAUTH_URL = [Will be provided after deployment, e.g., https://nexmart-staging.ondigitalocean.app]
JWT_SECRET = [Generate a random 32+ character string]
JWT_REFRESH_SECRET = [Generate a random 32+ character string]
CRON_SECRET = [Generate a random 32+ character string]
```

#### Cloudinary Variables:
```
CLOUDINARY_CLOUD_NAME = [Your Cloudinary cloud name, e.g., diwejo3da]
CLOUDINARY_API_KEY = [Your Cloudinary API key]
CLOUDINARY_API_SECRET = [Your Cloudinary API secret]
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = [Your Cloudinary cloud name]
```

#### NextAuth Variables:
```
GOOGLE_CLIENT_ID = [Your Google OAuth client ID]
GOOGLE_CLIENT_SECRET = [Your Google OAuth client secret]
```

#### Stripe Variables (Test Mode):
```
STRIPE_SECRET_KEY = sk_test_... (your test secret key)
STRIPE_WEBHOOK_SECRET = whsec_... (your test webhook secret)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_... (your test publishable key)
```

#### Email Variables:
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = [Your SMTP username]
SMTP_PASS = [Your SMTP password]
EMAIL_FROM = noreply@nexmart.com
RESEND_API_KEY = re_... (your Resend API key)
RESEND_FROM_EMAIL = NexMart Maroc <noreply@nexmart.ma>
```

#### App Configuration:
```
NEXT_PUBLIC_APP_URL = [Will be provided after deployment]
NEXT_PUBLIC_APP_NAME = NexMart Staging
DEFAULT_ORGANIZATION_SLUG = nexmart
ADMIN_EMAIL = admin@nexmart.com
DISABLE_REDIS = true
```

#### Feature Flags:
```
NEXT_PUBLIC_ENABLE_ANALYTICS = true
NEXT_PUBLIC_MAINTENANCE_MODE = false
NEXT_PUBLIC_ENABLE_AI_CHAT = true
NEXT_PUBLIC_ENABLE_AI_SEARCH = true
```

#### JWT Settings:
```
JWT_EXPIRES_IN = 15m
JWT_REFRESH_EXPIRES_IN = 7d
```

### Step 6: Configure Health Check
DigitalOcean will automatically configure this from `.do/app.yaml`:
- **Path**: `/api/health`
- **Check Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3
- **Initial Delay**: 40s

### Step 7: Deploy
1. Click **Create Resources** or **Deploy**
2. Wait for build (5-15 minutes)
3. Monitor deployment logs in DigitalOcean console
4. Once deployed, note the staging URL

### Step 8: Update NEXTAUTH_URL
After deployment, the staging URL will be provided (e.g., `https://nexmart-staging.ondigitalocean.app`):
1. Go to **Settings** → **Components** → **web** → **Settings** → **Env Vars**
2. Find `NEXTAUTH_URL`
3. Update it to the staging URL
4. Find `NEXT_PUBLIC_APP_URL`
5. Update it to the staging URL
6. Click **Save**
7. The app will redeploy automatically

---

## After Deployment: Provide Me With

Once deployment succeeds, provide me with:
1. **Staging URL** (e.g., `https://nexmart-staging.ondigitalocean.app`)
2. **Any deployment errors** (without secrets)
3. **Health check status** (check logs for `/api/health` results)

---

## What I Will Do After You Provide the Staging URL

### Phase 3: Verify Shared Data
1. **Test Health Check**: Verify `/api/health` returns 200
2. **Test Product Listing**: Verify `/api/products` returns products
3. **Test Product Detail**: Verify product pages load with Cloudinary images
4. **Test Authentication**: Test registration and login
5. **Test Cart**: Add/update/remove cart items
6. **Test Checkout**: Create test order in Stripe test mode
7. **Test Admin CMS**: Login and test product management
8. **Test Mobile API**: Test mobile login and orders endpoints
9. **Verify Database**: Confirm using existing Neon database
10. **Report Results**: Provide actual URLs and test outcomes

### Phase 4: Replace Vercel Services
1. **Configure External Cron Scheduler**: Set up CronJob.org or EasyCron
2. **Update Webhook URLs**: Update Stripe webhook URL in Stripe dashboard
3. **Update OAuth Callbacks**: Update Google OAuth callback URL
4. **Test Cron Jobs**: Verify cron endpoints work with external scheduler
5. **Document Changes**: List all Vercel services replaced

### Phase 5: Mobile App
1. **Update EAS Config**: Change API URL to staging
2. **Build Test APK**: Create Android APK with staging URL
3. **Test Mobile App**: Verify all features work against staging
4. **Document Results**: Mobile testing report

### Phase 6: Production Cutover (Awaiting Your Approval)
Will provide:
- Production cutover checklist
- DNS change instructions
- Rollback procedure
- Expected downtime
- Monthly hosting costs
- Security recommendations

---

## Important Notes

### Production Status: UNCHANGED ✅
- Vercel production still running: https://nexmart-ma1-main.vercel.app
- Neon database unchanged (no migration)
- Cloudinary unchanged
- Production DNS unchanged
- Mobile app still using production API

### Security ⚠️
- ❌ Do NOT paste production credentials into chat
- ❌ Do NOT use production Stripe keys in staging
- ✅ Use DigitalOcean's secure environment variable manager
- ✅ Generate new secrets for staging (separate from production)
- ✅ Use test-mode Stripe keys for staging

### Database
- Staging will use existing Neon database
- This is intentional for Phase 2 (shared data verification)
- For production isolation, consider creating separate staging database

### Cron Jobs
- Cron endpoints are protected with CRON_SECRET
- External scheduler required (DigitalOcean doesn't support cron natively)
- Will configure after deployment succeeds

---

## Troubleshooting

### Build Fails
- Check deployment logs in DigitalOcean console
- Verify all environment variables are set
- Check DATABASE_URL format
- Ensure Dockerfile syntax is correct

### Health Check Fails
- Verify `/api/health` endpoint exists
- Check DATABASE_URL is correct
- Ensure Neon database is accessible
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

## Cost Estimate

**DigitalOcean App Platform**:
- Basic XXS: $5/month (512MB RAM, 0.25 vCPU)
- Basic XS: $12/month (1GB RAM, 1 vCPU) - Recommended for production
- Basic S: $24/month (2GB RAM, 1 vCPU)

**Additional Costs**:
- Neon database: Starting at $19/month (if using separate staging DB)
- Bandwidth: Included up to 1TB/month
- Storage: Included 10GB (SSD)

**Vercel Savings**: By migrating to DigitalOcean, you save Vercel hosting costs.

---

## Next Steps

1. **YOU**: Deploy to DigitalOcean using these instructions
2. **YOU**: Provide the staging URL
3. **ME**: Test all endpoints and functionality
4. **ME**: Report actual results with URLs
5. **BOTH**: Address any issues found
6. **YOU**: Approve before production changes

---

## Current Status

**Phase 1**: ✅ Complete (Security Audit)
**Phase 2**: ⏳ In Progress (Awaiting Your Deployment)
**Phase 3**: ⏸️ Pending (Awaiting Staging URL)
**Phase 4**: ⏸️ Pending (Awaiting Staging Verification)
**Phase 5**: ⏸️ Pending (Awaiting Staging Verification)
**Phase 6**: ⏸️ Pending (Awaiting Your Approval)

---

**Branch**: staging-digitalocean
**Repository**: https://github.com/mystore-stack/nexmart/tree/staging-digitalocean
**Waiting For**: You to deploy in DigitalOcean and provide staging URL
