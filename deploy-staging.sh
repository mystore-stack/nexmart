#!/bin/bash

# Staging Deployment Script for NexMart (Phase 1)
# Uses existing Neon PostgreSQL and Cloudinary storage
# No database migration or DNS changes

set -e

echo "🚀 NexMart Staging Deployment (Phase 1)"
echo "====================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  - Provider: Docker (DigitalOcean-like)"
echo "  - Database: Neon PostgreSQL (existing production)"
echo "  - Storage: Cloudinary (existing production)"
echo "  - Environment: Staging"
echo "  - URL: https://staging.nexmart.ma"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

if [ ! -f ".env.staging" ]; then
    echo -e "${RED}Error: .env.staging file not found${NC}"
    echo "Please create .env.staging from the template"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"

# Build Docker images
echo ""
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build

# Stop existing containers
echo ""
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# Start staging containers
echo ""
echo -e "${YELLOW}Starting staging containers...${NC}"
docker-compose up -d

# Wait for application to be ready
echo ""
echo -e "${YELLOW}Waiting for application to be ready...${NC}"
sleep 10

# Health check
echo ""
echo -e "${YELLOW}Running health check...${NC}"
if curl -f http://localhost:3000/api/health; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "Check logs with: docker-compose logs app"
    exit 1
fi

# Generate Prisma client
echo ""
echo -e "${YELLOW}Generating Prisma client...${NC}"
docker-compose exec app npx prisma generate

echo ""
echo -e "${GREEN}✅ Staging deployment completed successfully!${NC}"
echo ""
echo "Access the staging environment:"
echo "  - Application: http://localhost:3000"
echo "  - Health check: http://localhost:3000/api/health"
echo "  - Logs: docker-compose logs -f"
echo "  - Stop: docker-compose down"
echo ""
echo "Note: This staging environment uses your existing Neon PostgreSQL"
echo "      and Cloudinary storage. No data migration was performed."