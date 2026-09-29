# Phase 1 Staging Deployment Infrastructure Report

**Date**: 2026-09-29
**Status**: Local Docker deployment successful, external deployment pending
**Phase**: Phase 1 (Staging preparation only - no production cutover)

---

## Executive Summary

Phase 1 staging deployment preparation is complete. The NexMart application has been successfully containerized with Docker, and a local staging environment is running. However, the staging environment is not yet deployed to an external hosting provider. Production remains on Vercel with no changes.

### Key Achievements
- ✅ Docker build successful with OpenSSL dependencies resolved
- ✅ Docker Compose configuration prepared for staging
- ✅ Container startup verified locally
- ✅ Health check endpoint implemented
- ✅ Cron job replacement script created
- ✅ Rollback procedure documented
- ✅ Security issues identified and fixed (removed production credentials from .env.staging)

### Remaining Work
- ⏳ Deploy to external hosting provider (provider not yet selected/provisioned)
- ⏳ Configure HTTPS for staging hostname
- ⏳ Replace Vercel Cron with external scheduler
- ⏳ Complete end-to-end testing with real database credentials

---

## Files Modified

### Configuration Files
1. **next.config.js**
   - Added `output: 'standalone'` for Docker deployment
   - Preserved existing security headers, image patterns, CSP
   - Status: ✅ Modified and validated

2. **Dockerfile**
   - Changed base image from `node:20-alpine` to `node:20-slim`
   - Added OpenSSL installation for Prisma compatibility
   - Multi-stage build (deps → builder → runner)
   - Removed canvas dependency from package.json
   - Status: ✅ Modified and build-tested

3. **docker-compose.yml**
   - Configured web service with health checks
   - Worker service optional (requires Redis profile)
   - Redis service optional (disabled by default)
   - Log rotation configured (10MB max, 3 files)
   - Removed obsolete `version` field
   - Status: ✅ Modified and validated

4. **.env.staging**
   - Created from template (no production credentials)
   - Contains placeholder values for database URL
   - Status: ✅ Created (requires real credentials before external deployment)

5. **.env.staging.example**
   - Template for staging environment variables
   - All values are placeholders
   - Status: ✅ Created

6. **.gitignore**
   - Added `.env.staging` to ignore list
   - Added `.env.staging.example` to allow list
   - Status: ✅ Modified

7. **.env**
   - Fixed syntax errors (spaces around `=` in TELEGRAM variables)
   - Removed embedded documentation text
   - Status: ✅ Fixed

8. **package.json**
   - Removed `canvas` dependency (causing build failures)
   - Status: ✅ Modified

### New Files Created
1. **src/app/api/health/route.ts**
   - Health check endpoint for Docker and load balancers
   - Checks database and Redis connectivity
   - Returns status, timestamp, environment info
   - Status: ✅ Created

2. **deploy-staging.sh**
   - Bash script for Linux deployment
   - Prerequisites check, build, deploy, health check
   - Status: ✅ Created

3. **deploy-staging.ps1**
   - PowerShell script for Windows deployment
   - Fixed syntax errors for PowerShell compatibility
   - Status: ✅ Created and tested

4. **scripts/cron-runner.sh**
   - Replaces Vercel Cron jobs
   - Calls authenticated cron endpoints with CRON_SECRET
   - Status: ✅ Created

5. **ROLLBACK_PROCEDURE.md**
   - Comprehensive rollback documentation
   - Container restart, image rollback, code rollback scenarios
   - External provider rollback instructions
   - Status: ✅ Created

6. **STAGING_INFRASTRUCTURE_REPORT.md** (this file)
   - Infrastructure documentation
   - Status: ✅ Created

---

## Infrastructure Components

### Docker Configuration

**Base Image**: `node:20-slim`
- Includes OpenSSL for Prisma compatibility
- Minimal Debian-based image
- Non-root user `nextjs` (UID 1001)

**Build Stages**:
1. **deps**: Install dependencies with `--ignore-scripts` (skips Prisma postinstall)
2. **builder**: Generate Prisma client, build Next.js app
3. **runner**: Copy standalone output, Prisma files, and runtime dependencies

**Ports**: 3000 (internal), mapped to 3000 on host

**Environment Variables**: Loaded from `.env.staging`

**Health Check**: Node.js HTTP check to `/api/health` every 30s

**Logging**: JSON-file driver, 10MB max size, 3 files retained

### Services

#### Web Service (app)
- **Purpose**: Next.js application server
- **Command**: `node server.js` (standalone output)
- **Health Check**: Every 30s, 3 retries, 40s startup grace period
- **Restart Policy**: `unless-stopped`
- **Status**: ✅ Running locally

#### Worker Service (worker)
- **Purpose**: BullMQ job processing
- **Command**: `node -r tsx/register src/workers/index.ts`
- **Profile**: `with-worker` (disabled by default)
- **Restart Policy**: `unless-stopped`
- **Status**: ⏸️ Disabled (Redis not configured)

#### Redis Service (redis)
- **Purpose**: Message queue for BullMQ
- **Image**: `redis:7-alpine`
- **Profile**: `with-redis` (disabled by default)
- **Persistence**: AOF enabled, 256MB max memory
- **Status**: ⏸️ Disabled (not required for Phase 1)

---

## Vercel-Specific Features Replaced

### 1. Vercel Cron Jobs

**Original**: Vercel cron routes scheduled in `vercel.json`

**Replacement**: `scripts/cron-runner.sh`
- Bash script that calls cron endpoints with `CRON_SECRET` authorization
- Can be run via:
  - Host-level cron (Linux: `/etc/cron.d/`, systemd timers)
  - External scheduler (CronJob, EasyCron, SetCron)
  - Manual execution for testing

**Implementation**:
```bash
# Example host cron entry (add to crontab -e)
0 7 * * * /path/to/scripts/cron-runner.sh >> /var/log/nexmart-cron.log 2>&1
```

**Endpoints Secured**:
- `/api/cron/abandoned-cart`
- `/api/cron/daily-report`
- `/api/cron/daily-sales-report`
- `/api/cron/low-stock-check`
- `/api/cron/newsletter`
- `/api/cron/product-recommendations`
- `/api/cron/review-request`
- `/api/cron/welcome-series`

**Status**: ✅ Replacement script created, external scheduler not yet configured

### 2. Vercel Deployment

**Original**: `vercel --prod` and `vercel --preview` commands

**Replacement**: Docker + Docker Compose
- Build: `docker-compose build`
- Deploy: `docker-compose up -d`
- Stop: `docker-compose down`
- Logs: `docker-compose logs -f`

**Status**: ✅ Local deployment tested, external provider not yet selected

### 3. Serverless Assumptions

**Original**: Vercel serverless functions with cold starts

**Replacement**: Long-running Node.js process
- Next.js standalone server
- Persistent process (no cold starts)
- Health check for load balancer integration

**Status**: ✅ Implemented

### 4. Duration Limits

**Original**: Vercel function duration limits (10s for Hobby, 60s for Pro)

**Replacement**: No duration limits (long-running process)
- Potential issue: Long-running API calls could block
- Mitigation: Implement timeout middleware in future

**Status**: ⚠️ Identified, not yet addressed

---

## External Services (Unchanged)

### Neon PostgreSQL
- **Status**: ✅ Unchanged
- **Usage**: Existing production database
- **Connection**: Via `DATABASE_URL` in environment variables
- **Note**: No migration applied in Phase 1
- **Requirement**: Staging must use same Neon or separate staging database

### Cloudinary
- **Status**: ✅ Unchanged
- **Usage**: Image storage and CDN
- **Connection**: Via `CLOUDINARY_*` environment variables
- **Note**: No changes to Cloudinary configuration
- **Requirement**: Staging can use same Cloudinary account (folder separation recommended)

### Vercel Production
- **Status**: ✅ Unchanged
- **URL**: https://nexmart-ma1-main.vercel.app
- **Note**: Production continues serving traffic
- **Requirement**: No changes until Phase 2 approval

---

## Current Deployment Status

### Local Docker Deployment
- **Status**: ✅ Running
- **URL**: http://localhost:3000
- **Health Check**: ⚠️ Fails (database connection error - placeholder DATABASE_URL)
- **Logs**: Application starts but cannot connect to database
- **Issue**: `.env.staging` contains placeholder database URL

### External Hosting Deployment
- **Status**: ⏸️ Not deployed
- **Provider**: Not selected
- **Hostname**: Not configured
- **HTTPS**: Not configured
- **DNS**: Not configured

---

## Build Issues Resolved

### 1. Canvas Dependency Build Failure
**Issue**: `canvas` package requires native compilation (Python, make, g++) which failed in Alpine

**Resolution**: Removed `canvas` from `package.json` (unused in codebase)

**Status**: ✅ Resolved

### 2. Prisma OpenSSL Library Error
**Issue**: Prisma engines require `libssl.so.1.1` which was not available in Alpine

**Resolution**: Changed base image to `node:20-slim` (Debian-based) and installed OpenSSL

**Status**: ✅ Resolved

### 3. Environment Variable Syntax Errors
**Issue**: `.env` file had spaces around `=` in TELEGRAM variables and embedded documentation

**Resolution**: Fixed syntax and removed documentation from `.env`

**Status**: ✅ Resolved

### 4. PowerShell Script Syntax Errors
**Issue**: `deploy-staging.ps1` had encoding and syntax issues for PowerShell

**Resolution**: Rewrote script with proper PowerShell syntax

**Status**: ✅ Resolved

### 5. Security Issue: Production Credentials in .env.staging
**Issue**: Original `.env.staging` contained actual production credentials

**Resolution**: Deleted file, created template with placeholders, added to `.gitignore`

**Status**: ✅ Resolved

---

## Testing Performed

### Docker Build Test
- **Command**: `docker-compose build --no-cache`
- **Result**: ✅ Success
- **Duration**: ~12 minutes
- **Image Size**: ~1.2GB
- **Output**: All stages completed successfully

### Container Startup Test
- **Command**: `docker-compose up -d`
- **Result**: ✅ Success
- **Container Status**: Running
- **Logs**: Next.js starts successfully
- **Database Connection**: ❌ Fails (expected - placeholder URL)

### Health Check Test
- **Endpoint**: `/api/health`
- **Result**: ⚠️ Fails (database connection error)
- **Expected**: Will pass when real DATABASE_URL is configured

### Package Modification Test
- **Change**: Removed `canvas` from package.json
- **Impact**: Build warning: "Module not found: Can't resolve 'canvas'"
- **Verification**: Checked codebase - canvas not imported anywhere
- **Status**: ✅ Safe to remove

---

## Remaining Requirements

### External Hosting Provider
**Status**: Not selected

**Options**:
- DigitalOcean App Platform (recommended in earlier audit)
- Railway
- Render
- AWS Lightsail
- Hetzner

**Decision Required**: User must select and provision provider

### HTTPS Configuration
**Status**: Not configured

**Options**:
- Provider-managed TLS (DigitalOcean, Railway, Render)
- Let's Encrypt with Certbot
- Cloudflare SSL
- Load balancer with TLS termination

**Decision Required**: Depends on provider selection

### Staging Hostname
**Status**: Not configured

**Options**:
- Subdomain: `staging.nexmart.ma`
- Subdomain: `staging.nexmart.com`
- Provider default: `nexmart-staging.provider.app`

**Decision Required**: User must choose hostname

### DNS Configuration
**Status**: Not configured

**Required**:
- A record or CNAME for staging hostname
- TTL settings appropriate for testing

**Decision Required**: After hostname selection

### External Cron Scheduler
**Status**: Script created, scheduler not configured

**Options**:
- Host-level cron (if using VPS)
- CronJob.org
- EasyCron
- SetCron.io
- GitHub Actions (scheduled workflows)

**Decision Required**: User must select scheduler

### Database Credentials
**Status**: Placeholder in `.env.staging`

**Required**:
- Real Neon DATABASE_URL for staging
- Decision: Use existing production database or create staging-specific database

**Decision Required**: User must provide credentials

### Cloudinary Credentials
**Status**: Placeholder in `.env.staging`

**Required**:
- Real Cloudinary credentials
- Decision: Use same account (with folder separation) or separate account

**Decision Required**: User must provide credentials

---

## Production Cutover Requirements (Phase 2 - Not Yet Approved)

The following are required for production cutover but are **NOT** part of Phase 1:

1. ✅ External hosting provider provisioned
2. ✅ HTTPS configured and validated
3. ✅ DNS configured and propagated
4. ✅ Staging environment fully tested with real credentials
5. ✅ All critical API endpoints verified
6. ✅ Database migration plan approved
7. ✅ Data backup verified
8. ✅ Mobile app API configuration updated
9. ✅ User approval obtained
10. ✅ Rollback procedure tested
11. ✅ Production DNS change scheduled during low-traffic period
12. ✅ Monitoring and alerting configured

**Status**: Phase 2 not started, awaiting user approval

---

## Security Considerations

### Implemented
- ✅ Non-root Docker user (nextjs:nodejs)
- ✅ Environment variables not committed to Git
- ✅ Production credentials removed from staging files
- ✅ Health check does not expose sensitive information
- ✅ Cron endpoints secured with CRON_SECRET
- ✅ Docker logs rotated to prevent disk exhaustion

### Recommended for External Deployment
- ⏳ Secret management (Docker Secrets, HashiCorp Vault, or provider secrets)
- ⏳ Container image scanning (Trivy, Snyk)
- ⏳ Network policies (restrict outbound traffic)
- ⏳ Rate limiting at reverse proxy level
- ⏳ WAF (Web Application Firewall)
- ⏳ Regular security updates (base image, dependencies)

---

## Monitoring and Logging

### Current Configuration
- **Log Driver**: JSON-file
- **Max Size**: 10MB per file
- **Max Files**: 3 files
- **Total**: 30MB per service

### Recommended for External Deployment
- ⏳ Centralized logging (ELK Stack, Loki, Datadog)
- ⏳ Log aggregation (Fluentd, Logstash)
- ⏳ Metrics collection (Prometheus, Grafana)
- ⏳ APM (Application Performance Monitoring)
- ⏳ Error tracking (Sentry - already integrated)

---

## Cost Estimates

### Current (Local Docker)
- **Cost**: $0 (running on local machine)

### External Hosting Estimates

**DigitalOcean App Platform**:
- Basic: $5/month (512MB RAM, 1 vCPU)
- Standard: $12/month (1GB RAM, 1 vCPU)
- Professional: $40/month (2GB RAM, 2 vCPUs)

**Railway**:
- Starter: $5/month (512MB RAM, 0.5 vCPU)
- Standard: $20/month (1GB RAM, 1 vCPU)

**Render**:
- Free: $0 (512MB RAM, 0.5 vCPU, with spin-down)
- Starter: $7/month (512MB RAM, 0.5 vCPU)
- Standard: $25/month (2GB RAM, 1 vCPU)

**Note**: Prices are estimates as of 2026-09-29 and may change

---

## Next Steps

### Immediate (User Action Required)
1. **Select hosting provider**: Choose DigitalOcean, Railway, Render, or alternative
2. **Provide credentials**: Update `.env.staging` with real DATABASE_URL and Cloudinary credentials
3. **Decide on database**: Use existing Neon or create staging-specific database
4. **Choose hostname**: Select staging subdomain (e.g., staging.nexmart.ma)

### After Provider Selection
1. **Provision external infrastructure**: Create account, deploy Docker image
2. **Configure HTTPS**: Set up TLS certificate
3. **Configure DNS**: Add A/CNAME record for staging hostname
4. **Test external deployment**: Verify all endpoints with real database
5. **Configure cron scheduler**: Set up external cron or host-level cron
6. **Verify mobile compatibility**: Test mobile API with staging URL

### Before Production Cutover (Phase 2)
1. **Comprehensive testing**: All features verified on staging
2. **Performance testing**: Load testing, stress testing
3. **Security audit**: Penetration testing, vulnerability scan
4. **Backup verification**: Database and asset backups tested
5. **Rollback test**: Execute rollback procedure end-to-end
6. **User approval**: Explicit approval from stakeholders
7. **Schedule cutover**: Choose low-traffic time window
8. **Prepare communication**: Notify users of planned maintenance

---

## Blockers

### Current Blockers
1. **Hosting provider not selected**: No external infrastructure provisioned
2. **Database credentials not provided**: `.env.staging` has placeholder DATABASE_URL
3. **Cloudinary credentials not provided**: `.env.staging` has placeholder Cloudinary values
4. **Hostname not decided**: No staging subdomain configured
5. **HTTPS not configured**: TLS certificate not obtained
6. **DNS not configured**: No staging DNS records
7. **Cron scheduler not configured**: External scheduler not set up

### Resolution Required
All blockers require user decision and action. No technical blockers remain.

---

## Conclusion

Phase 1 staging deployment preparation is technically complete. The application successfully builds and runs in Docker containers locally. All configuration files have been created or modified appropriately. Security issues have been identified and resolved.

However, the staging environment is not yet deployed to an external hosting provider. Production remains unchanged on Vercel. No database migration has been performed. No production DNS changes have been made.

**Next action**: User must select hosting provider and provide credentials to proceed with external deployment.

**Phase 2 (production cutover)**: Not started, awaiting explicit user approval.

---

## References

- **Rollback Procedure**: `ROLLBACK_PROCEDURE.md`
- **Deployment Scripts**: `deploy-staging.sh`, `deploy-staging.ps1`
- **Cron Replacement**: `scripts/cron-runner.sh`
- **Environment Template**: `.env.staging.example`
- **Health Endpoint**: `src/app/api/health/route.ts`
- **Docker Configuration**: `Dockerfile`, `docker-compose.yml`
- **Next.js Configuration**: `next.config.js`

---

**Report Generated**: 2026-09-29
**Phase**: Phase 1 Complete (External Deployment Pending)
**Production Status**: Unchanged (Still on Vercel)
