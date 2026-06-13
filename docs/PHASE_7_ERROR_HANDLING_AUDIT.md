# PHASE 7: PRODUCTION HARDENING - ERROR HANDLING & LOGGING AUDIT

## Audit Date
June 13, 2026

## Existing Implementation

### API Error Handling (`src/lib/api-response.ts`)
- ✅ Unified API response system with strict typing
- ✅ Success response helpers (ok, created, noContent)
- ✅ Error response helpers (fail, badRequest, unauthorized, forbidden, notFound, conflict, validationError, tooManyRequests, serverError, serviceUnavailable)
- ✅ Zod error handler with detailed validation errors
- ✅ Error classification system (VALIDATION, AUTHENTICATION, AUTHORIZATION, NOT_FOUND, CONFLICT, RATE_LIMIT, SERVER, UNKNOWN)
- ✅ Automatic error-to-response mapping
- ✅ Development vs production error messages
- ✅ Pagination helpers

### Global Error Handling
- ✅ Global error page (`src/app/global-error.tsx`)
- ✅ Sentry integration for error tracking
- ✅ App-level error page (`src/app/error.tsx`)
- ✅ Error digest for tracking
- ✅ User-friendly error messages

### Automation Logging (`src/lib/automation/logger.ts`)
- ✅ Automation logging service
- ✅ Success, failure, and pending logging
- ✅ Database persistence of automation logs
- ✅ Organization-level log queries
- ✅ Entity-level log queries
- ✅ Error handling in logging (doesn't break main flow)

### API Wrapper (`src/lib/withApi.ts`)
- ✅ Global API wrapper with automatic error catching
- ✅ Guaranteed NextResponse return
- ✅ Authentication/authorization error handling
- ✅ Custom error logging
- ✅ Request logging (optional)

## Missing Features

### Error Handling
1. ❌ **No structured logging**
   - Console.log used instead of structured logger
   - No log levels (DEBUG, INFO, WARN, ERROR)
   - No log correlation IDs
   - Risk: Difficult debugging, poor observability

2. ❌ **No error context tracking**
   - No request ID tracking
   - No user context in errors
   - No stack trace preservation
   - Risk: Difficult to trace errors

3. ❌ **No error aggregation**
   - No error grouping
   - No error frequency tracking
   - No error trend analysis
   - Risk: Missed patterns

4. ❌ **No retry logic**
   - No automatic retry for transient errors
   - No exponential backoff
   - No circuit breaker pattern
   - Risk: Unnecessary failures

5. ❌ **No graceful degradation**
   - No fallback mechanisms
   - No partial responses
   - No degraded mode
   - Risk: Complete service failure

6. ❌ **No error recovery strategies**
   - No automatic recovery
   - No manual recovery options
   - No recovery workflows
   - Risk: Prolonged outages

### Logging
7. ❌ **No centralized logging**
   - Logs scattered across files
   - No log aggregation service
   - No log search capability
   - Risk: Difficult troubleshooting

8. ❌ **No log retention policy**
   - Logs accumulate indefinitely
   - No automatic cleanup
   - No log archiving
   - Risk: Storage bloat

9. ❌ **No sensitive data masking**
   - User emails in logs
   - User IDs in logs
   - API keys potentially in logs
   - Risk: PII exposure

10. ❌ **No performance logging**
    - No request duration logging
    - No database query logging
    - No API call logging
    - Risk: Performance issues undetected

11. ❌ **No audit logging**
    - No audit trail for sensitive operations
    - No change tracking
    - No compliance logging
    - Risk: Compliance violations

12. ❌ **No business event logging**
    - No business metrics logging
    - No user journey tracking
    - No conversion tracking
    - Risk: Business insights lost

### Monitoring
13. ❌ **No error rate monitoring**
    - No error rate alerts
    - No error threshold monitoring
    - No error spike detection
    - Risk: Silent failures

14. ❌ **No health check endpoints**
    - No liveness probe
    - No readiness probe
    - No dependency health checks
    - Risk: Unhealthy services undetected

15. ❌ **No alerting**
    - No error alerts
    - No performance alerts
    - No availability alerts
    - Risk: Slow incident response

### Error Pages
16. ❌ **No specific error pages**
    - Generic error page for all errors
    - No 404 page
    - No 500 page
    - Risk: Poor user experience

17. ❌ **No error page localization**
    - French only
    - No multi-language support
    - Risk: Poor UX for international users

## Required Enhancements

### Critical (P0)
1. Implement structured logging with log levels
2. Add request ID tracking
3. Implement error aggregation
4. Add sensitive data masking
5. Implement health check endpoints
6. Add error rate monitoring
7. Implement log retention policy
8. Add performance logging

### High (P1)
9. Implement retry logic with exponential backoff
10. Add circuit breaker pattern
11. Implement graceful degradation
12. Add centralized logging service
13. Implement audit logging
14. Add business event logging
15. Implement alerting

### Medium (P2)
16. Add specific error pages (404, 500, etc.)
17. Implement error recovery strategies
18. Add error page localization
19. Implement log search capability
20. Add log archiving

### Low (P3)
21. Implement advanced error analytics
22. Add error prediction
23. Implement automated error resolution
24. Add error reporting dashboard
25. Implement comprehensive test suite

## Implementation Plan

### Step 1: Structured Logging
1. Create structured logger service
2. Implement log levels (DEBUG, INFO, WARN, ERROR)
3. Add request ID tracking
4. Add context tracking (user, organization)
5. Implement log correlation
6. Test structured logging

### Step 2: Error Handling Enhancement
1. Implement retry logic
2. Add exponential backoff
3. Implement circuit breaker
4. Add graceful degradation
5. Implement error recovery
6. Test error handling

### Step 3: Logging Enhancement
1. Implement centralized logging
2. Add sensitive data masking
3. Implement performance logging
4. Add audit logging
5. Implement business event logging
6. Test logging

### Step 4: Monitoring
1. Implement health check endpoints
2. Add error rate monitoring
3. Implement alerting
4. Add performance monitoring
5. Test monitoring

### Step 5: Error Pages
1. Create specific error pages
2. Add error page localization
3. Implement error page routing
4. Test error pages

### Step 6: Log Management
1. Implement log retention policy
2. Add log archiving
3. Implement log search
4. Test log management

## Structured Logging Implementation

### Logger Service
```typescript
// src/lib/logger.ts
import { randomUUID } from 'crypto';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: Date;
  correlationId?: string;
}

class Logger {
  private context: LogContext = {};

  setContext(ctx: LogContext) {
    this.context = { ...this.context, ...ctx };
  }

  clearContext() {
    this.context = {};
  }

  private log(level: LogLevel, message: string, error?: Error, additionalContext?: LogContext) {
    const entry: LogEntry = {
      level,
      message,
      context: { ...this.context, ...additionalContext },
      error,
      timestamp: new Date(),
      correlationId: this.context.requestId || randomUUID(),
    };

    // Mask sensitive data
    const maskedEntry = this.maskSensitiveData(entry);

    // Output based on level
    switch (level) {
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.log(JSON.stringify(maskedEntry));
        }
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(maskedEntry));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(maskedEntry));
        break;
      case LogLevel.ERROR:
        console.error(JSON.stringify(maskedEntry));
        // Send to error tracking service
        this.sendToErrorTracking(maskedEntry);
        break;
    }

    // Send to centralized logging service
    this.sendToLogService(maskedEntry);
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, undefined, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, error, context);
  }

  private maskSensitiveData(entry: LogEntry): LogEntry {
    const masked = { ...entry };
    
    if (masked.context) {
      // Mask email
      if (masked.context.email) {
        const email = masked.context.email as string;
        masked.context.email = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      }
      
      // Mask user ID
      if (masked.context.userId) {
        masked.context.userId = (masked.context.userId as string).substring(0, 8) + '***';
      }
      
      // Mask API keys
      Object.keys(masked.context).forEach(key => {
        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
          masked.context[key] = '***';
        }
      });
    }
    
    return masked;
  }

  private sendToErrorTracking(entry: LogEntry) {
    // Send to Sentry or similar service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(entry.error, {
        extra: entry.context,
        tags: { level: entry.level, correlationId: entry.correlationId },
      });
    }
  }

  private sendToLogService(entry: LogEntry) {
    // Send to centralized logging service (e.g., Loggly, Datadog, etc.)
    // Implementation depends on logging service choice
  }
}

export const logger = new Logger();
```

### Request ID Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || randomUUID();
  
  logger.setContext({
    requestId,
    path: request.nextUrl.pathname,
    method: request.method,
  });

  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  
  return response;
}
```

## Retry Logic Implementation

### Retry with Exponential Backoff
```typescript
// src/lib/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    retryableErrors?: string[];
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'],
  } = options;

  let delay = initialDelay;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const errorMessage = (error as Error).message;
      const isRetryable = retryableErrors.some(err => errorMessage.includes(err));

      if (!isRetryable) {
        throw lastError;
      }

      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
        error: errorMessage,
        delay,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}
```

## Circuit Breaker Implementation

### Circuit Breaker Pattern
```typescript
// src/lib/circuit-breaker.ts
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: Date;
  private successCount = 0;

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private recoveryAttempts: number = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.recoveryAttempts) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure > this.timeout;
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = undefined;
    this.successCount = 0;
  }
}
```

## Health Check Implementation

### Health Check Endpoint
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache } from '@/lib/redis';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  try {
    // Database health
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = { status: 'healthy' };
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = { status: 'unhealthy', error: (error as Error).message };
  }

  try {
    // Redis health
    await getCache('health:check');
    health.checks.redis = { status: 'healthy' };
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.redis = { status: 'unhealthy', error: (error as Error).message };
  }

  // External services (Stripe, OpenAI, etc.)
  // Add checks as needed

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
```

## Performance Logging Implementation

### Performance Logger
```typescript
// src/lib/performance-logger.ts
export class PerformanceLogger {
  private startTimes = new Map<string, number>();

  start(label: string) {
    this.startTimes.set(label, Date.now());
  }

  end(label: string) {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      logger.warn(`Performance measurement not started for: ${label}`);
      return;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(label);

    logger.info(`Performance: ${label}`, {
      duration,
      unit: 'ms',
    });

    // Log slow operations
    if (duration > 1000) {
      logger.warn(`Slow operation: ${label}`, { duration });
    }

    return duration;
  }

  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

export const perfLogger = new PerformanceLogger();
```

## Deployment Checklist

### Pre-Deployment
- [ ] Structured logging implemented
- [ ] Request ID tracking implemented
- [ ] Error aggregation implemented
- [ ] Sensitive data masking implemented
- [ ] Health check endpoints implemented
- [ ] Error rate monitoring implemented
- [ ] Log retention policy implemented
- [ ] Performance logging implemented
- [ ] Retry logic implemented
- [ ] Circuit breaker implemented
- [ ] Graceful degradation implemented
- [ ] Centralized logging configured
- [ ] Audit logging implemented
- [ ] Business event logging implemented
- [ ] Alerting configured

### Deployment
- [ ] Logger service deployed
- [ ] Middleware deployed
- [ ] Health check endpoints deployed
- [ ] Monitoring deployed
- [ ] Alerting deployed

### Post-Deployment
- [ ] Structured logging verified
- [ ] Request IDs verified
- [ ] Error aggregation verified
- [ ] Health checks passing
- [ ] Monitoring active
- [ ] Alerting configured
- [ ] Log retention working
- [ ] Performance metrics tracked

## Testing Plan

### Unit Tests
- Logger functionality
- Error classification
- Retry logic
- Circuit breaker
- Performance logger
- Health checks

### Integration Tests
- Logging integration
- Error tracking integration
- Monitoring integration
- Alerting integration

### E2E Tests
- Error flows
- Recovery flows
- Health check flows
- Monitoring flows
