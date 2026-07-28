# NexStore Marketplace UI - Deployment Guide

## Quick Start: Vercel Deployment (Recommended)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub account with repository access
- Environment variables configured

### Step 1: Connect to Vercel

```bash
# Option A: Using CLI
npm i -g vercel
vercel login
vercel link

# Option B: Using Web UI
1. Go to https://vercel.com/new
2. Select "Next.js"
3. Connect your GitHub repository
4. Select the repository
5. Click "Deploy"
```

### Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Database
DATABASE_URL=your_postgres_connection_string

# Stripe (if using payment)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# AI Features (if using)
OPENAI_API_KEY=sk_xxxxx

# Analytics
NEXT_PUBLIC_GA_ID=G_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://nexstore.ma
```

### Step 3: Deploy

```bash
# Automatic deployment on git push
git push origin main

# Or manual deployment
vercel deploy --prod
```

### Step 4: Verify Deployment

1. Visit your Vercel domain: `https://your-project.vercel.app`
2. Check deployment status: https://vercel.com/dashboard
3. Monitor logs: `vercel logs`
4. Run health check: `curl https://your-domain.com/api/health`

---

## Local Development

### Setup

```bash
# 1. Clone repository
git clone https://github.com/nexstore/nexstore.git
cd nexstore

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Setup database
npx prisma migrate dev

# 5. Start development server
npm run dev
```

### Development Server

```bash
# Start on http://localhost:3000
npm run dev

# With custom port
npm run dev -- -p 3001
```

---

## Staging Environment

### Setup Staging Branch

```bash
# Create staging branch
git checkout -b staging
git push -u origin staging
```

### Vercel Staging Deployment

1. In Vercel Dashboard, create new project from same repository
2. Set production branch to `staging`
3. Add environment variables for staging
4. Test on staging URL

### Smoke Tests

```bash
# Run smoke tests on staging
npm run test:smoke -- --url=https://staging-nexstore.vercel.app

# Or manual verification
curl https://staging-nexstore.vercel.app/api/health
```

---

## Production Environment

### Pre-Production Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Performance metrics acceptable
- [ ] Security audit passed
- [ ] Staging validation complete
- [ ] Backup of database
- [ ] Rollback plan documented
- [ ] Team briefed on deployment

### Production Deployment

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Run final tests
npm run build
npm run test

# 3. Create release tag
npm version patch  # or minor/major
git push origin main --tags

# 4. Vercel auto-deploys on push to main
# Monitor at: https://vercel.com/dashboard

# 5. Verify deployment
vercel inspect production-url
```

### Post-Deployment Verification

```bash
# Check deployment status
vercel inspect https://nexstore.ma

# Monitor real user performance
# Go to Vercel Analytics dashboard

# Check error tracking
# Go to Sentry dashboard

# Monitor uptime
# Go to UptimeRobot dashboard
```

---

## Database Migrations

### Staging Migrations

```bash
# Run migrations in staging
vercel env pull .env.local  # Pull staging DB connection
npx prisma migrate deploy

# Or via Vercel CLI
vercel env ls
```

### Production Migrations

```bash
# 1. Backup production database
# (done automatically on Vercel)

# 2. Run migrations
npx prisma migrate deploy

# 3. Verify migration success
npx prisma migrate status

# 4. If rollback needed
npx prisma migrate resolve --rolled-back migration_name
```

---

## Monitoring & Alerts

### Real User Monitoring

**Vercel Analytics** (Built-in)
- Core Web Vitals
- Response times
- Error rates
- Traffic patterns

Dashboard: https://vercel.com/dashboard → Select Project → Analytics

### Error Tracking (Sentry)

```bash
# Setup Sentry
npm install @sentry/nextjs

# Configure in next.config.js
const withSentryConfig = require("@sentry/nextjs/cjs/withSentryWebpackPlugin");

module.exports = withSentryConfig(
  {
    // existing config
  },
  {
    org: "your-org",
    project: "nexstore",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

### Uptime Monitoring

Services:
- UptimeRobot (https://uptimerobot.com)
- StatusPage (https://www.statuspage.io)
- Better Uptime (https://betteruptime.com)

Setup:
1. Add monitoring URL: `https://nexstore.ma`
2. Set alert threshold: 5 minutes
3. Configure notifications: Email, Slack, PagerDuty
4. Test endpoint: `/api/health`

---

## Performance Optimization

### Image Optimization (CDN)

Use Cloudinary or Imgix:

```typescript
// Update image URLs in marketplace-data.ts
const imageUrl = `https://res.cloudinary.com/your-account/image/upload/q_auto,f_auto,w_${width}/${imagePath}`;
```

### Caching Strategy

**Vercel Cache Control Headers** (in vercel.json):

```json
{
  "headers": [
    {
      "source": "/api/products/:id",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/_next/image(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Database Query Optimization

```typescript
// Use Prisma select to minimize payload
const product = await db.product.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    price: true,
    images: true,
    // Only select needed fields
  },
});
```

---

## Security Deployment

### Environment Secrets

```bash
# Add secrets in Vercel
vercel env add STRIPE_SECRET_KEY
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY

# List secrets
vercel env ls
```

### HTTPS/SSL

- Vercel provides automatic SSL certificates
- All deployments are HTTPS by default
- Certificate auto-renewal handled by Vercel

### Security Headers

**Add to next.config.js**:

```javascript
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self' https: wss:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Rollback Procedure

### Option 1: Vercel Dashboard

1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments"
4. Find previous successful deployment
5. Click "Promote to Production"

### Option 2: Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel automatically deploys new version
```

### Option 3: Emergency Rollback

```bash
# Deploy previous tag
git checkout v1.0.0
git push -f origin main:main

# Or
vercel rollback
```

---

## Custom Domain Setup

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add domain: `nexstore.ma`
3. Choose between:
   - **Nameservers** (Vercel DNS)
   - **CNAME** (Current registrar)

### Using Vercel DNS (Recommended)

1. In Vercel: Copy nameservers
2. In domain registrar: Update nameservers
3. Wait for DNS propagation (15-48 hours)
4. Verify in Vercel dashboard

### Using CNAME Records

1. In Vercel: Get CNAME value
2. In domain registrar: Add CNAME record
3. Point `nexstore.ma` to Vercel CNAME
4. Verify in Vercel dashboard

---

## SSL Certificate

- Vercel automatically provisions SSL certificates
- Renewal happens automatically
- No action required
- Valid for 90 days (auto-renewed)

---

## Email Notifications

### Deployment Notifications

**Via Slack** (Recommended):
1. Install Vercel app in Slack
2. Subscribe to deployment notifications
3. Get real-time alerts

**Via Email**:
1. Vercel Dashboard → Settings → Email Notifications
2. Enable deployment notifications
3. Get email on each deployment

---

## Logging & Debugging

### View Deployment Logs

```bash
# Stream production logs
vercel logs production-url

# View specific deployment
vercel logs deployment-id
```

### Debug Production Issues

```bash
# SSH into deployment
vercel exec "npm run diagnostic"

# Or check Vercel edge logs
vercel logs edge-middleware

# Check function logs
vercel logs api
```

---

## Performance Benchmarks

### Target Metrics

After deployment, verify:

| Metric | Target | Method |
|--------|--------|--------|
| LCP | < 2.5s | Lighthouse |
| INP | < 200ms | Chrome DevTools |
| CLS | < 0.1 | Lighthouse |
| FCP | < 1.8s | Lighthouse |
| TTFB | < 800ms | WebPageTest |
| Accessibility | 90+ | Lighthouse |
| Performance | 90+ | Lighthouse |
| SEO | 95+ | Lighthouse |

### Run Benchmarks

```bash
# Local Lighthouse audit
npm run build
npm run start
# Go to http://localhost:3000
# Open Chrome DevTools → Lighthouse → Generate report

# Or use PageSpeed Insights
# https://pagespeed.web.dev/?url=https://nexstore.ma
```

---

## Disaster Recovery

### Database Backup & Restore

```bash
# Backup PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Full Project Recovery

```bash
# Clone from Git
git clone https://github.com/nexstore/nexstore.git

# Restore database
npx prisma migrate deploy

# Restore assets (if separate CDN)
# Download from S3/Cloudinary backups
```

---

## Team Collaboration

### Code Review Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit
3. Push to GitHub: `git push origin feature/name`
4. Create Pull Request
5. Get code review approval
6. Merge to main
7. Vercel automatically deploys

### Branch Strategy

- `main` → Production (auto-deploy)
- `staging` → Staging (auto-deploy)
- `develop` → Development (auto-deploy)
- `feature/*` → Feature branches (preview deployments)

### Vercel Preview Deployments

Each PR automatically gets:
- Unique preview URL
- Full environment clone
- Performance metrics
- Comments with deployment details

---

## Troubleshooting

### Common Issues

**Issue**: Deployment fails
- Check build logs: `vercel logs`
- Run local build: `npm run build`
- Check environment variables
- Verify database connection

**Issue**: Slow performance
- Check Core Web Vitals: Vercel Analytics
- Run Lighthouse audit
- Check database queries
- Monitor API response times

**Issue**: Static content not caching**
- Verify cache headers in vercel.json
- Check CDN logs
- Clear Vercel cache: `vercel cache clear`

**Issue**: Environment variables not loading
- Verify in Vercel dashboard
- Redeploy: `vercel redeploy`
- Check .env.local locally

### Get Help

- Vercel Support: https://vercel.com/support
- GitHub Discussions: https://github.com/vercel/next.js/discussions
- Community: Stack Overflow, Dev.to

---

## Success Criteria

Deployment is successful when:

✓ All tests pass
✓ Build completes in < 5 minutes
✓ No deployment errors
✓ Performance metrics meet targets
✓ Lighthouse score > 90
✓ All pages load correctly
✓ Navigation works
✓ Images load
✓ Database queries work
✓ No console errors
✓ Analytics flowing correctly

---

## Release Checklist (Every Deployment)

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Changelog updated
- [ ] Version bumped in package.json
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Performance validated
- [ ] Security audit done
- [ ] Stakeholders notified
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Go/No-Go decision made

---

**Last Updated**: July 26, 2026
**Status**: Ready for Production
**Deployment Method**: Vercel (Recommended)
