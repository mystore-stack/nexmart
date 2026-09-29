# Staging Deployment Rollback Procedure

## Overview
This document describes the rollback procedure for the NexMart staging deployment. The staging environment uses Docker containers and the existing Neon PostgreSQL database and Cloudinary storage remain unchanged.

## Scope
- **Staging only**: This procedure applies to the staging deployment, not production
- **No database migration**: No schema changes are applied to Neon during Phase 1
- **No production changes**: Vercel, production DNS, and production environment variables remain untouched
- **External services**: Neon and Cloudinary continue operating normally

## Rollback Scenarios

### 1. Container Restart (Application Issues)
Use this for application-level problems (code bugs, configuration errors, etc.).

```bash
# Stop the current staging container
docker-compose down

# Restart with the same image
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 2. Image Rollback (Build Issues)
Use this if a new Docker image introduces problems.

```bash
# Stop current containers
docker-compose down

# List available images
docker images | grep nexmart

# Tag the current problematic image (for reference)
docker tag nexmart-ma1-main-app:latest nexmart-ma1-main-app:failed-$(date +%Y%m%d-%H%M%S)

# Rebuild from previous state (if you have the previous Dockerfile)
docker-compose build --no-cache

# Or use a previously tagged image
# docker tag nexmart-ma1-main-app:previous nexmart-ma1-main-app:latest

# Start with the corrected image
docker-compose up -d

# Verify health
curl http://localhost:3000/api/health
```

### 3. Code Rollback (Git-based)
Use this if the deployed code needs to be reverted.

```bash
# Stop containers
docker-compose down

# Revert to previous commit
git log --oneline -10
git checkout <previous-commit-hash>

# Rebuild image
docker-compose build --no-cache

# Start containers
docker-compose up -d

# Verify
curl http://localhost:3000/api/health
```

### 4. Configuration Rollback
Use this if environment variables were incorrectly set.

```bash
# Stop containers
docker-compose down

# Restore previous .env.staging from backup
cp .env.staging.backup .env.staging

# Or manually edit .env.staging to correct values

# Restart containers
docker-compose up -d

# Verify
docker-compose logs app
```

### 5. Complete Staging Shutdown
Use this to completely remove the staging environment.

```bash
# Stop and remove containers
docker-compose down

# Remove the Docker image (optional)
docker rmi nexmart-ma1-main-app:latest

# Remove volumes (if any)
docker volume rm nexmart-ma1-main_redis_data

# Production remains unchanged:
# - Vercel production continues at https://nexmart-ma1-main.vercel.app
# - Neon database unchanged
# - Cloudinary storage unchanged
# - Production DNS unchanged
```

## External Hosting Rollback (When Deployed to Provider)

If staging is deployed to an external provider (DigitalOcean, Railway, Render, etc.):

### Provider-Specific Rollback

#### DigitalOcean App Platform
```bash
# Via CLI
doctl apps create-deployment <app-id> --spec deployment-spec-with-previous-image.yaml

# Or via dashboard:
# 1. Go to App console
# 2. Click "Deployments"
# 3. Select previous successful deployment
# 4. Click "Redeploy"
```

#### Railway
```bash
# Via CLI
railway down
railway up --service <service-name>

# Or via dashboard:
# 1. Go to project
# 2. Click "Deployments"
# 3. Select previous deployment
# 4. Click "Redeploy"
```

#### Render
```bash
# Via dashboard:
# 1. Go to service
# 2. Click "Deploys"
# 3. Find previous successful deploy
# 4. Click "Rollback"
```

### DNS Rollback (If Custom Domain Configured)
```bash
# Update DNS A record to point to previous deployment
# This is only needed if you changed the staging hostname

# Example: Change staging.nexmart.ma to point to previous IP
```

## Verification After Rollback

After any rollback, verify:

```bash
# Check container status
docker-compose ps

# Check application health
curl http://localhost:3000/api/health

# Check logs for errors
docker-compose logs app --tail=50

# Test database connectivity
curl http://localhost:3000/api/products

# Test authentication
curl http://localhost:3000/api/auth/session
```

## What Does NOT Need Rollback

The following remain unchanged during staging deployment and do not require rollback:

- **Neon PostgreSQL**: Database schema and data unchanged
- **Cloudinary**: All images and assets unchanged
- **Vercel Production**: Production site continues at https://nexmart-ma1-main.vercel.app
- **Production DNS**: No changes to production DNS records
- **Production Environment Variables**: No changes to Vercel environment variables
- **Mobile App**: Mobile app continues using production API at https://nexmart-ma1-main.vercel.app/api

## Emergency Contact

If rollback fails:
1. Stop all staging containers: `docker-compose down`
2. Verify production is still running: Visit https://nexmart-ma1-main.vercel.app
3. Document the issue in AGENTS.md
4. Escalate to infrastructure team

## Rollback Decision Criteria

Consider rollback if:
- Health check fails repeatedly
- Database connectivity issues
- API endpoints return 500 errors
- Authentication fails
- Critical features broken

Do NOT rollback for:
- Minor UI issues
- Non-critical warnings
- Performance degradation (unless severe)
- Log warnings that don't affect functionality

## Rollback Testing

Test rollback procedure periodically:
1. Deploy a known-good version
2. Deploy a test version with intentional issue
3. Execute rollback
4. Verify restored state
5. Document any issues found
