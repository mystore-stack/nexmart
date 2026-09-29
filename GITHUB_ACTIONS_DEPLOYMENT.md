# GitHub Actions Automated Deployment to DigitalOcean

I've created a GitHub Actions workflow for automated deployment. This will deploy to DigitalOcean automatically when you push to the `staging-digitalocean` branch.

---

## Option 1: GitHub Actions (Automated)

### Step 1: Add Secrets to GitHub Repository

Go to your GitHub repository: https://github.com/mystore-stack/nexmart/settings/secrets/actions

Add these secrets:

**DigitalOcean:**
```
DIGITALOCEAN_ACCESS_TOKEN = [Your DigitalOcean API token]
```

To get DigitalOcean API token:
1. Log in to https://cloud.digitalocean.com
2. Go to API → Tokens/Keys
3. Generate new token with "Write" scope
4. Copy the token

**Database:**
```
DATABASE_URL = [Your Neon connection string]
```

**Authentication:**
```
NEXTAUTH_SECRET = [Generate 32+ random chars]
JWT_SECRET = [Generate 32+ random chars]
JWT_REFRESH_SECRET = [Generate 32+ random chars]
CRON_SECRET = [Generate 32+ random chars]
```

**Cloudinary:**
```
CLOUDINARY_CLOUD_NAME = [Your cloud name]
CLOUDINARY_API_KEY = [Your API key]
CLOUDINARY_API_SECRET = [Your API secret]
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

**Admin:**
```
ADMIN_EMAIL = admin@nexmart.com
```

### Step 2: Trigger Deployment

Simply push to the `staging-digitalocean` branch:

```bash
git push origin staging-digitalocean
```

The GitHub Actions workflow will:
1. Build the Docker image
2. Deploy to DigitalOcean App Platform
3. Configure all environment variables
4. Wait for deployment to complete
5. Run health check
6. Output the staging URL

### Step 3: Monitor Deployment

Go to: https://github.com/mystore-stack/nexmart/actions

Watch the workflow progress. Once complete, the staging URL will be shown in the workflow logs.

---

## Option 2: Manual DigitalOcean Deployment

If you prefer manual deployment without GitHub Actions:

### Step 1: Log in to DigitalOcean
1. Go to https://cloud.digitalocean.com
2. Go to **Apps** → **Create App**

### Step 2: Connect GitHub
1. Click **GitHub** → **Connect to GitHub**
2. Authorize DigitalOcean
3. Select: `mystore-stack/nexmart`
4. Select branch: `staging-digitalocean`

### Step 3: Configure
1. **Resource Type**: Dockerfile
2. **Dockerfile Path**: Dockerfile
3. **Context**: /
4. **Region**: AMS, FRA, or LON
5. **Instance Size**: basic-xxs

### Step 4: Add Environment Variables

Add all the variables listed in "Option 1" to DigitalOcean App Settings → Env Vars.

### Step 5: Deploy
Click **Create Resources** and wait for deployment.

---

## Which Option Should You Choose?

**Choose Option 1 (GitHub Actions) if:**
- You want automated deployment on push
- You're comfortable with GitHub secrets
- You want reproducible deployments
- You want deployment history in GitHub

**Choose Option 2 (Manual) if:**
- You prefer DigitalOcean console UI
- You don't want to add secrets to GitHub
- You want full control over each deployment
- You're new to GitHub Actions

---

## Recommendation

I recommend **Option 1 (GitHub Actions)** for staging deployment because:
- ✅ Automated on push
- ✅ Consistent deployments
- ✅ Deployment history
- ✅ Easy rollback (push previous commit)
- ✅ No manual steps required after initial setup

---

## After Deployment

Regardless of which option you choose, provide me with:
1. The staging URL
2. Any deployment errors (without secrets)

I will then:
- Test health check
- Test product listing
- Test authentication
- Test cart functionality
- Test checkout (test mode)
- Test admin CMS
- Test mobile API
- Verify database connectivity
- Report actual results

---

## Current Status

**GitHub Actions Workflow**: ✅ Created
**Waiting For**: You to add secrets to GitHub OR deploy manually in DigitalOcean
**Branch**: staging-digitalocean
**Repository**: https://github.com/mystore-stack/nexmart/tree/staging-digitalocean
