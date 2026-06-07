# Production Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the NexMart marketing automation system to production, supporting 100,000+ customers and 10,000+ orders/month with high availability.

## Architecture Overview

### Production Stack
- **n8n**: Workflow automation (3 instances)
- **PostgreSQL**: Database (Primary + 2 replicas)
- **Redis**: Cache/deduplication (Primary + 2 replicas)
- **Load Balancer**: Nginx/HAProxy
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or CloudWatch

### Infrastructure Requirements
- **CPU**: 8+ cores per n8n instance
- **Memory**: 16GB+ per n8n instance
- **Storage**: 100GB+ SSD for database
- **Network**: 1Gbps+ bandwidth
- **Backup**: Offsite backup storage

## Prerequisites

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 14+
- Redis 7+
- Nginx 1.20+
- SSL certificate (Let's Encrypt or commercial)

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/nexmart
DIRECT_URL=postgresql://user:pass@host:5432/nexmart_direct

# Redis
REDIS_URL=redis://host:6379

# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=secure_password
N8N_HOST=n8n.yourdomain.com
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_ENCRYPTION_KEY=your_encryption_key_min_32_chars

# Integrations
TELEGRAM_ADMIN_CHAT_ID=your_chat_id
TELEGRAM_BOT_TOKEN=your_bot_token
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
GMAIL_SMTP_USER=your-email@gmail.com
GMAIL_SMTP_PASSWORD=your_app_password
FACEBOOK_ACCESS_TOKEN=your_fb_token
FACEBOOK_PIXEL_ID=your_pixel_id
OPENAI_API_KEY=your_openai_key
GOOGLE_SHEET_ID=your_sheet_id

# Queue Mode
QUEUE_BULL_REDIS=redis://host:6379
EXECUTIONS_MODE=queue
EXECUTIONS_TIMEOUT=3600
EXECUTIONS_TIMEOUT_MAX=7200
```

## Step 1: Database Setup

### 1.1 PostgreSQL Installation
```bash
# Install PostgreSQL 14
sudo apt update
sudo apt install postgresql-14 postgresql-contrib-14

# Initialize database
sudo -u postgres psql -c "CREATE DATABASE nexmart;"
sudo -u postgres psql -c "CREATE USER nexmart WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nexmart TO nexmart;"
```

### 1.2 Configure Replication
```bash
# On primary server
sudo -u postgres psql -c "ALTER SYSTEM SET wal_level = replica;"
sudo -u postgres psql -c "ALTER SYSTEM SET max_wal_senders = 3;"
sudo -u postgres psql -c "ALTER SYSTEM SET wal_keep_size = '1GB';"
sudo systemctl restart postgresql

# Create replication user
sudo -u postgres psql -c "CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replica_password';"
```

### 1.3 Apply Schema Extensions
```bash
# Merge marketing automation schema with existing schema
cat marketing-automation/postgresql-schema-extension.prisma >> prisma/schema.prisma

# Run migrations
npx prisma migrate dev
npx prisma db push
```

### 1.4 Create Indexes
```sql
-- Performance indexes
CREATE INDEX idx_orders_created ON "Order"(createdAt DESC);
CREATE INDEX idx_orders_status ON "Order"(status);
CREATE INDEX idx_cart_items_user ON "CartItem"("userId");
CREATE INDEX idx_notification_logs_created ON "NotificationLog"(createdAt DESC);
CREATE INDEX idx_facebook_events_sent ON "FacebookConversionEvent"(sentAt DESC);
```

## Step 2: Redis Setup

### 2.1 Redis Installation
```bash
# Install Redis 7
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

### 2.2 Redis Configuration
```conf
# redis.conf
bind 0.0.0.0
port 6379
maxmemory 4gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### 2.3 Configure Replication
```bash
# On primary server
sudo nano /etc/redis/redis.conf
# Add: replica-announce-ip your_primary_ip

# On replica servers
sudo nano /etc/redis/redis.conf
# Add: replicaof primary_ip 6379
# Add: masterauth your_redis_password
```

## Step 3: n8n Deployment

### 3.1 Docker Compose Configuration
```yaml
version: '3.8'

services:
  n8n-primary:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS=redis://redis:6379
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/workflows
    depends_on:
      - postgres
      - redis

  n8n-worker-1:
    image: n8nio/n8n:latest
    restart: always
    command: n8n worker
    environment:
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS=redis://redis:6379
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  n8n-worker-2:
    image: n8nio/n8n:latest
    restart: always
    command: n8n worker
    environment:
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS=redis://redis:6379
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      - POSTGRES_DB=nexmart
      - POSTGRES_USER=nexmart
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  n8n_data:
  postgres_data:
  redis_data:
```

### 3.2 Deploy Workflows
```bash
# Import workflows to n8n
for workflow in marketing-automation/workflows/*.json; do
  curl -X POST \
    -H "Content-Type: application/json" \
    -d @$workflow \
    http://localhost:5678/rest/workflows/import
done
```

### 3.3 Configure Credentials
1. Open n8n web interface
2. Go to Credentials → Add Credential
3. Add each required credential:
   - PostgreSQL
   - Redis
   - Gmail SMTP
   - Telegram API
   - OpenAI API
   - Facebook Graph API
   - Google Sheets

## Step 4: Load Balancer Setup

### 4.1 Nginx Configuration
```nginx
upstream n8n_backend {
    least_conn;
    server n8n-primary:5678;
    server n8n-worker-1:5678;
    server n8n-worker-2:5678;
}

server {
    listen 80;
    server_name n8n.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name n8n.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/n8n.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    location / {
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.2 SSL Certificate
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d n8n.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Step 5: Monitoring Setup

### 5.1 Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n-primary:5678', 'n8n-worker-1:5678', 'n8n-worker-2:5678']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

### 5.2 Grafana Dashboards
Create dashboards for:
- Workflow execution metrics
- Database performance
- Redis memory usage
- Error rates
- Queue depth

### 5.3 Alert Rules
```yaml
# alerting rules
groups:
  - name: n8n_alerts
    rules:
      - alert: HighErrorRate
        expr: error_rate > 0.1
        for: 5m
        annotations:
          summary: "High error rate detected"
      
      - alert: DatabaseConnectionPoolExhausted
        expr: db_connections_active / db_connections_max > 0.9
        for: 2m
        annotations:
          summary: "Database connection pool exhausted"
      
      - alert: RedisMemoryHigh
        expr: redis_memory_usage / redis_memory_max > 0.8
        for: 5m
        annotations:
          summary: "Redis memory usage high"
```

## Step 6: Backup Strategy

### 6.1 Database Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d)
pg_dump -U nexmart nexmart | gzip > $BACKUP_DIR/nexmart_$DATE.sql.gz

# Keep 30 days of backups
find $BACKUP_DIR -name "nexmart_*.sql.gz" -mtime +30 -delete

# Copy to offsite storage
aws s3 cp $BACKUP_DIR/nexmart_$DATE.sql.gz s3://backups/nexmart/
```

### 6.2 Redis Backups
```bash
# Redis snapshot backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backups/redis/dump_$(date +%Y%m%d).rdb
```

### 6.3 Workflow Backups
```bash
# Export all workflows
curl -H "Content-Type: application/json" \
  http://localhost:5678/rest/workflows \
  > /backups/workflows/workflows_$(date +%Y%m%d).json
```

## Step 7: Security Hardening

### 7.1 Firewall Configuration
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 7.2 n8n Security
```bash
# Enable basic auth
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=strong_password

# Enable encryption
N8N_ENCRYPTION_KEY=your_32_character_encryption_key

# Restrict webhook access
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/
```

### 7.3 Database Security
```sql
-- Create limited user for n8n
CREATE USER n8n_user WITH PASSWORD 'n8n_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO n8n_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO n8n_user;
```

## Step 8: Performance Optimization

### 8.1 Database Optimization
```sql
-- Connection pool settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
```

### 8.2 Redis Optimization
```conf
# Redis performance tuning
maxmemory-policy allkeys-lru
tcp-keepalive 300
timeout 0
tcp-backlog 511
```

### 8.3 n8n Optimization
```bash
# Queue mode configuration
EXECUTIONS_CONCURRENCY=10
EXECUTIONS_TIMEOUT=3600
QUEUE_BULL_REDIS_MAX_RETRIES=5
QUEUE_BULL_REDIS_RETRY_DELAY=1000
```

## Step 9: Testing

### 9.1 Smoke Tests
```bash
# Test n8n API
curl https://n8n.yourdomain.com/healthz

# Test database connection
psql -U nexmart -d nexmart -c "SELECT 1"

# Test Redis connection
redis-cli ping
```

### 9.2 Workflow Tests
```bash
# Trigger test workflows
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"order_id": "test-order-123"}' \
  https://n8n.yourdomain.com/webhook/order-confirmation
```

### 9.3 Load Testing
```bash
# Use k6 or similar tool
k6 run --vus 100 --duration 5m load-test.js
```

## Step 10: Go-Live Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database schema applied
- [ ] Redis configured and tested
- [ ] SSL certificate installed
- [ ] Load balancer configured
- [ ] Monitoring set up
- [ ] Backup strategy tested
- [ ] Security hardening completed
- [ ] Workflows imported and tested
- [ ] Credentials configured

### Post-Deployment
- [ ] Verify all workflows running
- [ ] Check monitoring dashboards
- [ ] Test webhook endpoints
- [ ] Verify email delivery
- [ ] Test Telegram notifications
- [ ] Check database performance
- [ ] Monitor Redis memory usage
- [ ] Review error logs
- [ ] Test failover procedures
- [ ] Document any issues

## Maintenance

### Regular Tasks
- **Daily**: Review error logs and DLQ
- **Weekly**: Review performance metrics
- **Monthly**: Review and optimize slow queries
- **Quarterly**: Review and update workflows
- **Annually**: Security audit and credential rotation

### Scaling
- **Horizontal**: Add more n8n worker instances
- **Vertical**: Increase CPU/memory allocation
- **Database**: Add read replicas for reporting
- **Redis**: Add Redis Cluster for high availability

## Troubleshooting

### Common Issues

**n8n not starting:**
- Check environment variables
- Verify database connection
- Check Redis connection
- Review logs: `docker logs n8n-primary`

**Workflows not executing:**
- Check queue mode status
- Verify Redis connection
- Check worker status
- Review execution logs

**High memory usage:**
- Check Redis memory settings
- Review workflow execution history
- Implement execution cleanup
- Increase available memory

**Database slow queries:**
- Review query performance
- Add missing indexes
- Optimize complex queries
- Consider read replicas

## Support & Resources
- n8n Documentation: https://docs.n8n.io
- PostgreSQL Documentation: https://www.postgresql.org/docs
- Redis Documentation: https://redis.io/documentation
- Docker Documentation: https://docs.docker.com

## Checklist
- [ ] Infrastructure provisioned
- [ ] Database configured
- [ ] Redis configured
- [ ] n8n deployed
- [ ] Workflows imported
- [ ] Credentials configured
- [ ] Load balancer configured
- [ ] SSL certificate installed
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Security hardening completed
- [ ] Performance optimized
- [ ] Testing completed
- [ ] Go-live approved
- [ ] Team trained
- [ ] Documentation updated
