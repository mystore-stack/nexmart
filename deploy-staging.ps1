# Staging Deployment Script for NexMart
$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "NexMart Staging Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$dockerInstalled = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)
$dockerComposeInstalled = $null -ne (Get-Command docker-compose -ErrorAction SilentlyContinue)

if (-not $dockerInstalled) {
    Write-Host "Error: Docker is not installed" -ForegroundColor Red
    exit 1
}

if (-not $dockerComposeInstalled) {
    Write-Host "Error: Docker Compose is not installed" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".env.staging")) {
    Write-Host "Error: .env.staging file not found" -ForegroundColor Red
    Write-Host "Please create .env.staging from .env.staging.example"
    exit 1
}

Write-Host "Prerequisites check passed" -ForegroundColor Green

# Build Docker image
Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Docker build completed" -ForegroundColor Green

# Stop existing containers
Write-Host ""
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "Containers stopped" -ForegroundColor Green

# Start containers
Write-Host ""
Write-Host "Starting staging containers..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start containers" -ForegroundColor Red
    exit 1
}
Write-Host "Containers started" -ForegroundColor Green

# Wait for application to be ready
Write-Host ""
Write-Host "Waiting for application to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Health check
Write-Host ""
Write-Host "Running health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Health check passed" -ForegroundColor Green
    } else {
        Write-Host "Health check failed (status: $($response.StatusCode))" -ForegroundColor Red
        Write-Host "Check logs with: docker-compose logs app"
        exit 1
    }
} catch {
    Write-Host "Health check failed (connection error)" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs app"
    exit 1
}

# Show logs
Write-Host ""
Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Application is running at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API is available at: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "View logs with: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "Stop containers with: docker-compose down" -ForegroundColor Yellow
Write-Host ""
