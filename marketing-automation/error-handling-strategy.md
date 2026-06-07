# Error Handling Strategy for Marketing Automation

## Overview
This document outlines the comprehensive error handling strategy for the NexMart marketing automation system using n8n. The strategy ensures production-grade reliability with proper retry logic, dead letter queues, and monitoring.

## Error Categories

### 1. Transient Errors
**Definition:** Temporary failures that can be resolved by retrying

**Examples:**
- Network timeouts
- Temporary API rate limits
- Database connection pool exhaustion
- Redis temporary unavailability

**Handling Strategy:**
- Automatic retry with exponential backoff
- Max 5 retries with delays: 1s, 2s, 4s, 8s, 16s
- Log retry attempts
- Alert after 3 failed retries

### 2. Permanent Errors
**Definition:** Failures that cannot be resolved by retrying

**Examples:**
- Invalid data format
- Authentication failures
- Configuration errors
- Missing required fields

**Handling Strategy:**
- No automatic retry
- Log to dead letter queue
- Send immediate alert to admin
- Manual intervention required

### 3. Rate Limit Errors
**Definition:** API rate limit exceeded

**Examples:**
- Gmail SMTP rate limit
- Telegram API rate limit
- Facebook CAPI rate limit
- OpenAI API rate limit

**Handling Strategy:**
- Implement rate limiting at workflow level
- Use queue mode for high-volume operations
- Exponential backoff with longer delays
- Monitor rate limit usage

### 4. Validation Errors
**Definition:** Data validation failures

**Examples:**
- Missing required fields
- Invalid email format
- Invalid phone number
- Data type mismatches

**Handling Strategy:**
- Validate data before processing
- Skip invalid records with warning
- Log validation failures
- Alert on high validation failure rate

## Retry Logic

### Exponential Backoff Strategy
```javascript
// Retry configuration
const retryConfig = {
  maxRetries: 5,
  backoffStrategy: 'exponential',
  initialDelay: 1000, // 1 second
  maxDelay: 16000, // 16 seconds
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'RATE_LIMIT_EXCEEDED'
  ]
};
```

### Implementation in n8n
1. Use **Error Trigger** nodes for retry logic
2. Configure **Wait** nodes with dynamic delays
3. Use **Function** nodes to calculate backoff
4. Set **Retry on Fail** in node settings

### Example Retry Workflow
```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.errorTrigger",
      "parameters": {
        "errorOutput": "error"
      }
    },
    {
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Calculate retry delay\nconst retryCount = $json.retryCount || 0;\nconst delay = Math.min(1000 * Math.pow(2, retryCount), 16000);\nreturn { json: { delay, retryCount: retryCount + 1 } };"
      }
    },
    {
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": "={{ $json.delay }}",
        "unit": "milliseconds"
      }
    }
  ]
}
```

## Dead Letter Queue (DLQ)

### Purpose
Store permanently failed operations for manual review and recovery

### Implementation
```sql
-- Dead Letter Queue Table
CREATE TABLE dead_letter_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id VARCHAR(255),
  execution_id VARCHAR(255),
  node_id VARCHAR(255),
  error_type VARCHAR(100),
  error_message TEXT,
  payload JSONB,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);
```

### DLQ Management
1. **Automatic DLQ Entry**: After max retries, move to DLQ
2. **Manual Review**: Admin reviews DLQ entries daily
3. **Retry Mechanism**: Admin can retry failed operations
4. **Archive**: Archive resolved entries after 30 days

### DLQ Monitoring
- Alert when DLQ size > 100 entries
- Daily DLQ summary report
- Categorize errors by type
- Track resolution time

## Redis Deduplication

### Purpose
Prevent duplicate operations and ensure idempotency

### Key Patterns
```
email:sent:{userId}:{type}:{hash} - TTL: 7 days
sms:sent:{userId}:{type}:{hash} - TTL: 24 hours
telegram:sent:{chatId}:{type}:{hash} - TTL: 1 hour
fb:event:{eventId} - TTL: 7 days
```

### Implementation
```javascript
// Check before operation
const key = `email:sent:${userId}:${type}:${hash}`;
const alreadySent = await redis.get(key);

if (alreadySent) {
  return { skipped: true, reason: 'already_sent' };
}

// Perform operation
await sendEmail(...);

// Set deduplication key
await redis.set(key, timestamp, 'EX', 604800);
```

## Circuit Breaker Pattern

### Purpose
Prevent cascading failures by stopping calls to failing services

### Implementation
```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'closed'; // closed, open, half-open
    this.lastFailureTime = null;
  }

  async execute(operation) {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

## Error Logging

### Log Levels
- **ERROR**: Critical failures requiring immediate attention
- **WARN**: Non-critical issues that should be reviewed
- **INFO**: Normal operation information
- **DEBUG**: Detailed debugging information

### Log Format
```json
{
  "timestamp": "2024-06-07T00:00:00Z",
  "level": "ERROR",
  "workflow": "abandoned-cart-recovery",
  "execution_id": "exec-123",
  "node": "email-send",
  "error": {
    "type": "SMTPError",
    "message": "Connection timeout",
    "code": "ETIMEDOUT"
  },
  "context": {
    "user_id": "user-123",
    "email": "customer@example.com"
  }
}
```

### Log Storage
- PostgreSQL: Structured error logs
- Redis: Recent errors for quick access
- External: Send to monitoring service (optional)

## Monitoring & Alerting

### Key Metrics
- Workflow execution success rate
- Average retry count
- Dead letter queue size
- Error rate by workflow
- Error rate by error type

### Alert Thresholds
- **Critical**: Error rate > 10% for any workflow
- **Warning**: Error rate > 5% for any workflow
- **Critical**: DLQ size > 100 entries
- **Warning**: DLQ size > 50 entries
- **Critical**: Circuit breaker open for > 5 minutes

### Alert Channels
- Telegram: Real-time critical alerts
- Email: Daily summary of warnings
- Slack: Team notifications (optional)

## Workflow-Specific Error Handling

### Abandoned Cart Recovery
**Common Errors:**
- Email delivery failures
- Coupon generation failures
- Database query timeouts

**Handling:**
- Retry email delivery up to 3 times
- Skip coupon generation on failure
- Log all failures for review

### Order Confirmation
**Common Errors:**
- Webhook timeout
- Email delivery failures
- Telegram API failures

**Handling:**
- Immediate retry for webhook failures
- Async email delivery with retry
- Fallback to email if Telegram fails

### Shipping Updates
**Common Errors:**
- Invalid tracking numbers
- Email delivery failures
- Database update failures

**Handling:**
- Validate tracking numbers before processing
- Retry email delivery
- Log database failures for manual fix

### Facebook CAPI
**Common Errors:**
- Rate limit exceeded
- Invalid event data
- Authentication failures

**Handling:**
- Implement rate limiting
- Validate event data before sending
- Alert on authentication failures

### Google Sheets Sync
**Common Errors:**
- API rate limits
- Authentication failures
- Sheet not found

**Handling:**
- Implement queue mode for sync
- Retry with exponential backoff
- Alert on authentication failures

## Recovery Procedures

### Manual Recovery from DLQ
1. Review DLQ entries
2. Identify root cause
3. Fix underlying issue
4. Retry failed operation
5. Mark as resolved
6. Document resolution

### Automated Recovery
- Implement retry workflow for DLQ
- Retry operations after 1 hour
- Max 3 automated retries
- Alert if all retries fail

### Data Consistency
- Implement transactional operations where possible
- Use database transactions for multi-step operations
- Implement compensating transactions for rollback
- Regular data integrity checks

## Testing Error Handling

### Unit Tests
- Test retry logic with mock failures
- Test circuit breaker behavior
- Test validation error handling
- Test DLQ operations

### Integration Tests
- Test with real API failures
- Test with network timeouts
- Test with invalid data
- Test with rate limits

### Chaos Testing
- Simulate service failures
- Test system under load
- Test recovery procedures
- Verify monitoring alerts

## Documentation

### Error Codes
| Code | Description | Severity | Action |
|------|-------------|----------|--------|
| SMTP001 | Email delivery failed | ERROR | Retry |
| DB001 | Database connection failed | ERROR | Retry |
| API001 | API rate limit exceeded | WARN | Back off |
| VAL001 | Data validation failed | WARN | Skip |
| AUTH001 | Authentication failed | ERROR | Alert |

### Runbooks
Create runbooks for common error scenarios:
- Email delivery failures
- Database connection issues
- API authentication failures
- Redis unavailability

## Best Practices

### Prevention
- Validate all input data
- Implement rate limiting
- Use connection pooling
- Monitor system health
- Implement circuit breakers

### Detection
- Comprehensive logging
- Real-time monitoring
- Automated alerts
- Regular health checks
- Performance metrics

### Recovery
- Automated retry logic
- Dead letter queue
- Manual recovery procedures
- Data consistency checks
- Rollback mechanisms

### Improvement
- Regular error analysis
- Identify recurring issues
- Update error handling
- Improve monitoring
- Document lessons learned

## Checklist
- [ ] Implement retry logic with exponential backoff
- [ ] Set up dead letter queue
- [ ] Configure Redis deduplication
- [ ] Implement circuit breakers
- [ ] Set up error logging
- [ ] Configure monitoring alerts
- [ ] Create error documentation
- [ ] Test error handling
- [ ] Document recovery procedures
- [ ] Train team on error handling
