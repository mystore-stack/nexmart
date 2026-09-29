# DigitalOcean Staging Deployment - Status and Next Steps

## ✅ What I Have Completed

### 1. Git Repository Prepared
- **Branch Created**: `staging-digitalocean`
- **Repository**: https://github.com/mystore-stack/nexmart/tree/staging-digitalocean
- **Status**: Pushed and ready for DigitalOcean

### 2. Docker Configuration
- **Dockerfile**: Updated for DigitalOcean compatibility
  - Base image: `node:20-slim` with OpenSSL
  - Multi-stage build (deps → builder → runner)
  - Prisma client generation
  - Next.js standalone output
- **.dockerignore**: Created to reduce build context size
- **next.config.js**: Added `output: 'standalone'`

### 3. Health Check
- **Endpoint**: `src/app/api/health/route.ts`
- **Path**: `/api/health`
- **Features**: Database and Redis connectivity checks
- **Status**: Committed and pushed

### 4. DigitalOcean Configuration
- **File**: `.do/app.yaml`
- **Config**: Health check, port 3000, basic-xxs instance
- **Status**: Committed and pushed

### 5. Documentation
- **DIGITALOCEAN_DEPLOYMENT_GUIDE.md**: Step-by-step deployment instructions
- **ROLLBACK_PROCEDURE.md**: Comprehensive rollback guide
- **STAGING_INFRASTRUCTURE_REPORT.md**: Full infrastructure documentation
- **.env.staging.example**: Environment variable template
- **Status**: All committed and pushed

### 6. Vercel Replacements
- **scripts/cron-runner.sh**: Replaces Vercel Cron jobs
- **deploy-staging.sh**: Linux deployment script
- **deploy-staging.ps1**: PowerShell deployment script
- **Status**: Committed and pushed

---

## 🔴 What YOU Must Do in DigitalOcean

### Step 1: Connect GitHub to DigitalOcean
1. Log in to https://cloud.digitalocean.com
2. Go to **Apps** → **Create App**
3. Click **GitHub** → **Connect to GitHub**
4. Authorize DigitalOcean
5. Select repository: `mystore-stack/nexmart`
6. Select branch: `staging-digitalocean`

### Step 2: Configure App in DigitalOcean
1. **Resource Type**: Dockerfile
2. **Repository**: mystore-stack/nexmart
3. **Branch**: staging-digitalocean
4. **Dockerfile Path**: Dockerfile
5. **Context**: /

### Step 3: Add Environment Variables (CRITICAL)
In DigitalOcean App Settings → Components → web → Settings → Env Vars, add:

**Required Variables:**
```
DATABASE_URL = [Your Neon connection string]
NEXTAUTH_SECRET = [Generate 32+ random chars]
NEXTAUTH_URL = [Your staging URL after deployment]
JWT_SECRET = [Generate 32+ random chars]
JWT_REFRESH_SECRET = [Generate 32+ random chars]
CRON_SECRET = [Generate 32+ random chars]
```

**Cloudinary:**
```
CLOUDINARY_CLOUD_NAME = [Your cloud name]
CLOUDINARY_API_KEY = [Your API key]
CLOUDINARY_API_SECRET = [Your API secret]
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = [Your cloud name]
```

**NextAuth:**
```
GOOGLE_CLIENT_ID = [Your Google OAuth client ID]
GOOGLE_CLIENT_SECRET = [Your Google OAuth client secret]
```

**Stripe (Test Mode):**
```
STRIPE_SECRET_KEY = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
```

**App Config:**
```
NODE_ENV = production
PORT = 3000
NEXT_PUBLIC_APP_URL = [Your staging URL]
NEXT_PUBLIC_APP_NAME = NexMart Staging
DEFAULT_ORGANIZATION_SLUG = nexmart
ADMIN_EMAIL = admin@nexmart.com
DISABLE_REDIS = true
```

**Email:**
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = [Your SMTP username]
SMTP_PASS = [Your SMTP password]
EMAIL_FROM = noreply@nexmart.com
RESEND_API_KEY = re_...
RESEND_FROM_EMAIL = NexMart Maroc <noreply@nexmart.ma>
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
1. **Region**: Choose closest (AMS, FRA, or LON)
2. **Instance Size**: Start with `basic-xxs` ($5/month)
3. **HTTP Port**: 3000
4. **Health Check**:
   - Path: `/api/health`
   - Check interval: 30s
   - Timeout: 10s
   - Retries: 3
   - Initial delay: 40s

### Step 5: Deploy
1. Click **Create Resources** or **Deploy**
2. Wait for build (5-15 minutes)
3. Monitor logs in DigitalOcean console
4. Note the staging URL when deployment completes

### Step 6: Provide Staging URL
Once deployment succeeds, provide me with:
- The staging URL (e.g., `https://nexmart-staging.ondigitalocean.app`)
- Any errors from deployment logs (without secrets)

---

## 🔍 What I Will Do After You Provide the Staging URL

### 1. Verify Health Check
```bash
curl https://[staging-url]/api/health
```
Expected: JSON with status "healthy", database "connected"

### 2. Test Product Listing
```bash
curl https://[staging-url]/api/products
```
Expected: JSON with product array

### 3. Test Product Detail
```bash
curl https://[staging-url]/products/[slug]
```
Expected: Product page loads with images

### 4. Test Authentication
- Test registration endpoint
- Test login endpoint
- Verify session creation

### 5. Test Cart Functionality
- Add items to cart
- Update quantities
- Remove items

### 6. Test Checkout (Test Mode)
- Create test order
- Verify Stripe test payment
- Check order creation

### 7. Test Admin CMS
- Login as admin
- Test product management
- Test homepage CMS

### 8. Test Mobile API
- Test mobile login endpoint
- Test mobile orders endpoint
- Verify Bearer token authentication

### 9. Verify Environment
- Check NODE_ENV is production
- Verify NEXT_PUBLIC_APP_URL
- Confirm database connectivity

### 10. Report Results
- Provide actual deployment URL
- List all test results
- Identify any issues
- Recommend fixes if needed

---

## ⚠️ Important Notes

### Production Status: UNCHANGED
- ✅ Vercel production still running: https://nexmart-ma1-main.vercel.app
- ✅ Neon database unchanged (no migration)
- ✅ Cloudinary unchanged
- ✅ Production DNS unchanged
- ✅ Mobile app still using production API

### Security
- ❌ Do NOT paste production credentials into chat
- ❌ Do NOT commit `.env.staging` to Git
- ✅ Use DigitalOcean's secure environment variable manager
- ✅ Generate new secrets for staging (separate from production)

### Database
- Current staging configuration uses placeholder DATABASE_URL
- You must provide real Neon connection string in DigitalOcean
- Option A: Use existing production database (not recommended for isolation)
- Option B: Create separate staging database in Neon (recommended)

### Cron Jobs
- Vercel Cron replaced with `scripts/cron-runner.sh`
- DigitalOcean App Platform does not support cron natively
- Options:
  - External cron service (CronJob.org, EasyCron)
  - GitHub Actions scheduled workflows
  - Not running cron in Phase 1 (acceptable for staging)

---

## 📋 Deployment Checklist

### Before Deployment
- [x] Git branch created and pushed
- [x] Dockerfile configured
- [x] Health check endpoint created
- [x] DigitalOcean app.yaml created
- [x] Documentation complete
- [ ] User connects GitHub to DigitalOcean
- [ ] User adds environment variables
- [ ] User deploys app

### After Deployment
- [ ] Deployment succeeds
- [ ] Health check returns 200
- [ ] Homepage loads
- [ ] Products API works
- [ ] Authentication works
- [ ] Cart works
- [ ] Checkout works (test mode)
- [ ] Admin CMS works
- [ ] Mobile API works
- [ ] Images load from Cloudinary
- [ ] No console errors

---

## 🚀 Next Steps

1. **You**: Deploy to DigitalOcean using the guide
2. **You**: Provide the staging URL
3. **Me**: Test all endpoints and functionality
4. **Me**: Report actual results with URLs
5. **Both**: Address any issues found
6. **You**: Approve before any production changes

---

## 📚 Reference Documents

- **Deployment Guide**: <ref_file file="C:\Users\AYMANE\Desktop\nexmart-moroccan-luxury11\nexmart-moroccan-luxury1\nexmart-ma1-main (6)\nexmart-ma1-main (3)\nexmart-ma1-main (2)\nexmart-ma1-main\DIGITALOCEAN_DEPLOYMENT_GUIDE.md" />
- **Rollback Procedure**: <ref_file file="C:\Users\AYMANE\Desktop\nexmart-moroccan-luxury11\nexmart-moroccan-luxury1\nexmart-ma1-main (6)\nexmart-ma1-main (3)\nexmart-ma1-main (2)\nexmart-ma1-main\ROLLBACK_PROCEDURE.md" />
- **Infrastructure Report**: <ref_file file="C:\Users\AYMANE\Desktop\nexmart-moroccan-luxury11\nexmart-moroccan-luxury1\nexmart-ma1-main (6)\nexmart-ma1-main (3)\nexmart-ma1-main (2)\nexmart-ma1-main\STAGING_INFRASTRUCTURE_REPORT.md" />
- **GitHub Branch**: https://github.com/mystore-stack/nexmart/tree/staging-digitalocean

---

**Current Status**: Ready for DigitalOcean deployment
**Branch**: staging-digitalocean
**Waiting For**: User to deploy in DigitalOcean and provide staging URL
