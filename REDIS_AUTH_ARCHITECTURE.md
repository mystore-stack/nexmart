# Redis-Based Enterprise Authentication System

## Overview

This document describes the production-grade enterprise authentication system implemented for the NexMart multi-tenant ecommerce platform. The system uses Redis as the source of truth for sessions, replacing the previous JWT-based authentication.

## Architecture

### Session Model

```typescript
interface SessionData {
  sessionId: string;        // UUID
  userId: string;           // User ID from database
  organizationId: string;   // Multi-tenant organization ID
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  email: string;
  deviceId: string;         // Device fingerprint
  ipAddress?: string;       // Optional IP binding
  userAgent?: string;       // Optional user agent
  createdAt: number;        // Timestamp
  expiresAt: number;       // Expiration timestamp
  lastActivityAt: number;   // Last activity timestamp
}
```

### Redis Data Structure

- **Session Storage**: `session:{sessionId}` → JSON session data (TTL: 7 days)
- **User Sessions**: `user_sessions:{userId}` → Set of session IDs (TTL: 7 days)

## Components

### 1. Session Manager (`src/lib/session-manager.ts`)

The `SessionManager` class handles all Redis session operations:

#### Methods

- `createSession(options)`: Creates a new session in Redis
- `getSession(sessionId)`: Validates and retrieves a session
- `deleteSession(sessionId)`: Deletes a specific session
- `deleteUserSessions(userId)`: Deletes all sessions for a user
- `getUserSessions(userId)`: Gets all active sessions for a user
- `rotateSession(oldSessionId, options)`: Creates new session, deletes old one
- `cleanupExpiredSessions()`: Maintenance function for expired sessions

### 2. Authentication Library (`src/lib/auth-redis.ts`)

The authentication library provides high-level authentication functions:

#### Functions

- `createSession(user, organizationId, req)`: Creates session and sets cookie
- `getSessionFromRequest(req)`: Gets session from HTTP request
- `getSession()`: Gets session from server context
- `requireAuth()`: Requires authentication (throws if not authenticated)
- `requireAuthFromRequest(req)`: Requires authentication from request
- `requireAdmin(req?)`: Requires admin role
- `deleteSession()`: Deletes current session
- `deleteSessionFromRequest(req)`: Deletes session from request
- `rotateSession(req?)`: Rotates session for security
- `deleteUserSessions(userId)`: Deletes all user sessions
- `getUserSessions(userId)`: Gets all user sessions

### 3. Middleware (`src/middleware.ts`)

The middleware validates sessions from Redis for all protected routes:

#### Features

- Validates session ID from `nexmart_session_id` cookie
- Fetches session from Redis
- Checks session expiration
- Redirects unauthenticated users to `/login`
- Protects `/admin` and `/api/admin` routes
- Enforces role-based access control
- Sets user context headers (`x-user-id`, `x-user-role`, `x-organization-id`)

### 4. Login Endpoint (`src/app/api/auth/login/route.ts`)

The login endpoint creates Redis sessions:

#### Flow

1. Validate credentials
2. Get user's organizationId
3. Create Redis session with device/IP information
4. Set secure HTTP-only cookie
5. Return session information

### 5. Logout Endpoint (`src/app/api/auth/logout/route.ts`)

The logout endpoint deletes sessions:

#### Flow

1. Get session ID from cookie
2. Delete session from Redis
3. Clear session cookie
4. Return success response

## Security Features

### 1. HTTP-Only Cookies

```typescript
cookieStore.set(SESSION_COOKIE, sessionId, {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_TTL,
});
```

### 2. Session Rotation

Sessions can be rotated for security:
- Creates new session with same data
- Deletes old session
- Updates cookie with new session ID

### 3. Device Management

- Each session has a unique device ID
- Support for multiple devices per user
- Ability to revoke specific device sessions
- Optional IP and user agent binding

### 4. Session Expiration

- Sessions expire after 7 days (configurable)
- Redis TTL automatically cleans expired sessions
- Last activity tracking for session management

### 5. Multi-Tenant Security

- OrganizationId is stored in session
- All database queries enforce organizationId filtering
- Prevents cross-organization data leakage

### 6. Role-Based Access Control

- Three roles: USER, ADMIN, SUPER_ADMIN
- Middleware enforces role requirements
- API routes validate roles
- Clear error messages for unauthorized access

## API Route Updates

All admin API routes have been updated to use the new authentication system:

### Updated Routes

- `/api/admin/products` - Products management
- `/api/admin/analytics` - Dashboard analytics
- `/api/admin/orders` - Order management
- `/api/admin/users` - User management
- `/api/admin/categories` - Category management
- `/api/admin/coupons` - Coupon management
- `/api/admin/diagnostics` - System diagnostics

### Usage Pattern

```typescript
import { requireAdmin } from "@/lib/auth-redis";

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  const organizationId = session.organizationId;
  // ... use organizationId for database queries
}
```

## Frontend Integration

### Cookie Configuration

All frontend fetch calls must include credentials:

```typescript
const res = await fetch("/api/admin/products", {
  credentials: "include",
});
```

### Error Handling

- 401 responses should redirect to `/login`
- 403 responses should show permission denied
- Session expiration should trigger re-authentication

## Logging and Observability

### Log Prefixes

- `[AUTH]` - Authentication operations
- `[SESSION]` - Session management operations
- `[MIDDLEWARE]` - Middleware decisions
- `[LOGIN]` - Login operations
- `[LOGOUT]` - Logout operations

### Key Logs

- Session creation and validation
- Authentication failures
- Role-based access decisions
- Session rotation
- Session deletion

## Migration from JWT

### Changes Made

1. **Removed JWT token generation** - No longer needed
2. **Removed JWT verification** - Replaced with Redis session validation
3. **Updated cookie name** - Changed from `nexmart_auth` to `nexmart_session_id`
4. **Updated middleware** - Now validates Redis sessions instead of JWT
5. **Updated API routes** - Use `requireAdmin` from `auth-redis`

### Backward Compatibility

The old JWT-based system is still present in `src/lib/auth.ts` for gradual migration. Once fully migrated, the old system can be removed.

## Performance Considerations

### Redis Performance

- Session validation is O(1) Redis operation
- Session creation is O(1) Redis operation
- Session deletion is O(1) Redis operation
- User session listing is O(n) where n is number of sessions

### Caching

- Sessions are cached in Redis with automatic expiration
- No database queries needed for session validation
- Fast session lookup for high-traffic scenarios

## Scalability

### Horizontal Scaling

- Redis can be clustered for horizontal scaling
- Session data is centralized in Redis
- Multiple application servers can share the same Redis instance
- Session state is maintained across server restarts

### High Availability

- Redis can be configured with replication
- Sentinel for automatic failover
- Cluster mode for distributed deployment

## Security Best Practices

### 1. Session Security

- Use strong random UUIDs for session IDs
- Set appropriate session TTL (7 days)
- Implement session rotation for sensitive operations
- Support session revocation

### 2. Cookie Security

- Always use HTTP-only cookies
- Use secure flag in production
- Set appropriate sameSite policy
- Set path to "/" for application-wide access

### 3. Multi-Tenant Security

- Always enforce organizationId in database queries
- Never trust client-provided organizationId
- Validate organizationId from session
- Prevent cross-organization data access

### 4. Role-Based Access

- Validate roles at both middleware and API level
- Use principle of least privilege
- Log all authorization failures
- Provide clear error messages

## Testing

### Unit Testing

Test session manager operations:
- Session creation
- Session validation
- Session expiration
- Session deletion
- Session rotation

### Integration Testing

Test authentication flow:
- Login → session creation → cookie setting
- API request → session validation → authorization
- Logout → session deletion → cookie clearing
- Session expiration → re-authentication

### End-to-End Testing

Test complete user flows:
- User login → dashboard access → data retrieval
- Admin login → admin operations → role enforcement
- Session expiration → automatic logout
- Multiple devices → session management

## Monitoring

### Key Metrics

- Session creation rate
- Session validation rate
- Session expiration rate
- Authentication failure rate
- Authorization failure rate

### Alerts

- High authentication failure rate
- High authorization failure rate
- Redis connection failures
- Session storage errors

## Deployment

### Environment Variables

Required environment variables:
- `REDIS_URL` - Redis connection string
- `NODE_ENV` - Environment (development/production)

### Redis Configuration

Recommended Redis settings:
- Max memory policy: `allkeys-lru`
- Persistence: RDB + AOF
- Replication: Master-slave
- Cluster: Redis Cluster for distributed deployment

### Rollback Plan

If issues occur:
1. Revert to JWT-based authentication
2. Restore old middleware
3. Restore old API routes
4. Clear Redis sessions

## Conclusion

The Redis-based authentication system provides:
- **Scalability**: Centralized session management
- **Security**: HTTP-only cookies, session rotation, device management
- **Reliability**: Redis persistence and replication
- **Performance**: Fast session validation without database queries
- **Multi-tenancy**: Built-in organizationId enforcement
- **Observability**: Comprehensive logging and monitoring

This enterprise-grade authentication system is production-ready and designed for high-traffic SaaS applications.
