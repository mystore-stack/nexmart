# Redis Structure for Marketing Automation

## Overview
Redis is used for deduplication, caching, rate limiting, and real-time tracking to ensure no duplicate emails/SMS are sent and to improve performance.

## Key Patterns

### 1. Email Deduplication
```
Pattern: email:sent:{userId}:{type}:{hash}
TTL: 7 days
Type: String
Value: timestamp

Example:
email:sent:user-123:abandoned-cart-1:a1b2c3d4 -> 1717689600
```

### 2. SMS Deduplication
```
Pattern: sms:sent:{userId}:{type}:{hash}
TTL: 24 hours
Type: String
Value: timestamp

Example:
sms:sent:user-123:order-confirm:xyz789 -> 1717689600
```

### 3. Telegram Deduplication
```
Pattern: telegram:sent:{chatId}:{type}:{hash}
TTL: 1 hour
Type: String
Value: timestamp

Example:
telegram:sent:123456789:low-stock:prod-456 -> 1717689600
```

### 4. Cart Activity Tracking
```
Pattern: cart:activity:{userId}
TTL: 48 hours
Type: Hash
Fields:
  - last_activity: timestamp
  - items_count: integer
  - cart_value: float
  - recovery_stage: integer (0-3)

Example:
cart:activity:user-123 -> {
  "last_activity": "1717689600",
  "items_count": "3",
  "cart_value": "599.00",
  "recovery_stage": "1"
}
```

### 5. Abandoned Cart Lock
```
Pattern: cart:lock:{userId}
TTL: 30 minutes
Type: String
Value: workflow_execution_id

Purpose: Prevent multiple workflows from processing the same cart simultaneously
```

### 6. Order Status Cache
```
Pattern: order:status:{orderId}
TTL: 24 hours
Type: String
Value: status

Example:
order:status:order-456 -> "SHIPPED"
```

### 7. Rate Limiting
```
Pattern: ratelimit:{type}:{identifier}
TTL: 1 hour
Type: String
Value: request_count

Example:
ratelimit:email:user-123 -> "5"
ratelimit:sms:+212600000000 -> "3"
```

### 8. Workflow Execution Lock
```
Pattern: workflow:lock:{workflowId}:{entityId}
TTL: 5 minutes
Type: String
Value: execution_timestamp

Purpose: Prevent duplicate workflow executions
```

### 9. Coupon Cache
```
Pattern: coupon:valid:{code}
TTL: 24 hours
Type: String
Value: JSON object with coupon details

Example:
coupon:valid:SAVE5NOW -> {
  "code": "SAVE5NOW",
  "type": "percentage",
  "value": 5,
  "min_order": 100,
  "expires": "1717776000"
}
```

### 10. Product Stock Cache
```
Pattern: product:stock:{productId}
TTL: 5 minutes
Type: String
Value: stock_level

Example:
product:stock:prod-789 -> "3"
```

### 11. Low Stock Alert Sent
```
Pattern: alert:lowstock:{productId}
TTL: 1 hour
Type: String
Value: timestamp

Purpose: Prevent duplicate low stock alerts
```

### 12. Customer LTV Cache
```
Pattern: customer:ltv:{userId}
TTL: 1 hour
Type: String
Value: lifetime_value

Example:
customer:ltv:user-123 -> "3500.00"
```

### 13. VIP Customer Cache
```
Pattern: customer:vip:{userId}
TTL: 24 hours
Type: String
Value: "true" or "false"

Example:
customer:vip:user-123 -> "true"
```

### 14. Facebook Event Deduplication
```
Pattern: fb:event:{eventId}
TTL: 7 days
Type: String
Value: timestamp

Purpose: Prevent duplicate Facebook Conversion API events
```

### 15. Daily Report Cache
```
Pattern: report:daily:{date}:{organizationId}
TTL: 2 hours
Type: String
Value: JSON report data

Example:
report:daily:2024-06-07:org-123 -> {...}
```

### 16. Weekly Report Cache
```
Pattern: report:weekly:{week}:{organizationId}
TTL: 24 hours
Type: String
Value: JSON report data

Example:
report:weekly:2024-W23:org-123 -> {...}
```

### 17. AI Generated Content Cache
```
Pattern: ai:content:{type}:{hash}
TTL: 7 days
Type: String
Value: generated_content

Purpose: Cache AI-generated content to reduce API calls
```

### 18. Google Sheets Sync Lock
```
Pattern: sheets:lock:{sheetId}
TTL: 10 minutes
Type: String
Value: sync_timestamp

Purpose: Prevent concurrent Google Sheets sync operations
```

### 19. Retry Queue
```
Pattern: retry:{workflowId}:{executionId}
TTL: 1 hour
Type: List
Value: JSON objects with retry information

Purpose: Store failed operations for retry
```

### 20. Dead Letter Queue
```
Pattern: dlq:{workflowId}
TTL: 7 days
Type: List
Value: JSON objects with failed operation details

Purpose: Store permanently failed operations for manual review
```

## Redis Commands Reference

### Setting Deduplication Keys
```bash
# Check if email already sent
EXISTS email:sent:user-123:abandoned-cart-1:hash

# Set email as sent (with TTL)
SETEX email:sent:user-123:abandoned-cart-1:hash 604800 1717689600
```

### Cart Activity Tracking
```bash
# Update cart activity
HSET cart:activity:user-123 last_activity 1717689600 items_count 3 cart_value 599.00
EXPIRE cart:activity:user-123 172800

# Get cart activity
HGETALL cart:activity:user-123
```

### Rate Limiting
```bash
# Increment rate limit counter
INCR ratelimit:email:user-123
EXPIRE ratelimit:email:user-123 3600

# Check rate limit
GET ratelimit:email:user-123
```

### Lock Management
```bash
# Acquire lock (SETNX with expiration)
SET cart:lock:user-123 execution-id NX EX 1800

# Release lock
DEL cart:lock:user-123
```

### Queue Operations
```bash
# Add to retry queue
LPUSH retry:workflow-123:exec-456 '{"attempt":1,"max_attempts":5}'

# Remove from retry queue
RPOP retry:workflow-123:exec-456
```

## Best Practices

1. **Always set TTL** on all keys to prevent memory bloat
2. **Use atomic operations** for locks (SETNX)
3. **Implement exponential backoff** for retries
4. **Monitor Redis memory usage** and set maxmemory policy
5. **Use connection pooling** for high-throughput operations
6. **Implement circuit breakers** for Redis failures
7. **Log all Redis operations** for debugging
8. **Use Redis transactions** (MULTI/EXEC) for complex operations
9. **Consider Redis Cluster** for high availability
10. **Backup Redis data** regularly

## Performance Considerations

- **Memory**: Allocate at least 2GB for production with 100k+ customers
- **Connection Pool**: Use 50-100 connections for high throughput
- **Persistence**: Enable AOF for durability, RDB for backups
- **Replication**: Use master-slave replication for high availability
- **Monitoring**: Monitor memory, connections, and slow queries
