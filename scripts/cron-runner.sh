#!/bin/bash

# Cron Job Runner for Staging Environment
# Replaces Vercel cron jobs with system cron or manual execution
# This script runs all scheduled tasks for the staging environment

set -e

APP_URL="${APP_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-your-cron-secret}"

echo "🕐 Running NexMart Scheduled Tasks"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to run a cron job
run_cron_job() {
    local job_name=$1
    local endpoint=$2
    local time=$3
    
    echo -e "${YELLOW}Running: $job_name${NC} at $time"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $CRON_SECRET" \
        -H "Content-Type: application/json" \
        -X POST \
        "$APP_URL$endpoint" \
        -d '{"type":"'$job_name'"}')
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ $job_name completed successfully${NC}"
    else
        echo -e "${RED}✗ $job_name failed (HTTP $http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
}

# Daily Sales Report (7:00 AM UTC equivalent)
run_cron_job "daily_report" "/api/notifications/telegram" "7:00 AM"

# Low Stock Check (8:00 AM UTC equivalent)
run_cron_job "low_stock" "/api/notifications/telegram" "8:00 AM"

# Abandoned Cart Recovery (24h check)
run_cron_job "abandoned_cart" "/api/cron/abandoned-cart" "9:00 AM"

echo -e "${GREEN}✅ All scheduled tasks completed${NC}"