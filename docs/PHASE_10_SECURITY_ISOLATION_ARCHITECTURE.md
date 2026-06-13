# PHASE 10: SAAS SECURITY & ISOLATION - DESIGN

## System Overview

The SaaS Security & Isolation system ensures tenant data isolation, role-based access control (RBAC), audit logging, and security monitoring. It implements Row-Level Security (RLS) patterns, audit trails, and security event monitoring.

## 1. System Architecture Design

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│              API Request                                   │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  RBAC       │  │  Audit      │
│  Check      │  │  Logger     │
│  (Middleware)│  │  (Service)   │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Data       │  │  Security   │
│  Isolation  │  │  Monitor   │
│  (RLS)      │  │  (Alerts)   │
└──────┬───────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Database   │  │  Audit Log  │
│  (Prisma)   │  │  Storage)   │
└─────────────┘  └─────────────┘
```

### Security Flow
1. **Authentication**: User authenticated
2. **RBAC Check**: Role and permissions validated
3. **Data Isolation**: Tenant data scoped to organization
4. **Audit Logging**: Action logged
5. **Security Monitoring**: Security events monitored
6. **Alerting**: Suspicious activity alerted

## 2. Prisma Schema Updates

### Audit Log Model (Already Added)
```prisma
model AuditLog {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @db.Uuid
  userId         String?  @db.Uuid
  
  // Action details
  action         String
  entityType     String
  entityId       String?
  
  // Context
  ipAddress      String?
  userAgent      String?
  metadata       Json?
  
  // Timestamps
  createdAt      DateTime @default(now())
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User?        @relation("UserAuditLogs", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

## 3. RBAC System

### Role-Based Access Control
```typescript
// src/lib/saas/rbac.ts
export enum OrgRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum Permission {
  // Organization permissions
  ORG_VIEW = 'ORG_VIEW',
  ORG_MANAGE = 'ORG_MANAGE',
  ORG_DELETE = 'ORG_DELETE',
  
  // Billing permissions
  BILLING_VIEW = 'BILLING_VIEW',
  BILLING_MANAGE = 'BILLING_MANAGE',
  
  // User permissions
  USER_VIEW = 'USER_VIEW',
  USER_MANAGE = 'USER_MANAGE',
  USER_DELETE = 'USER_DELETE',
  
  // Product permissions
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  PRODUCT_MANAGE = 'PRODUCT_MANAGE',
  PRODUCT_DELETE = 'PRODUCT_DELETE',
  
  // Order permissions
  ORDER_VIEW = 'ORDER_VIEW',
  ORDER_MANAGE = 'ORDER_MANAGE',
  ORDER_DELETE = 'ORDER_DELETE',
}

export const ROLE_PERMISSIONS: Record<OrgRole, Permission[]> = {
  [OrgRole.OWNER]: Object.values(Permission),
  [OrgRole.ADMIN]: [
    Permission.ORG_VIEW,
    Permission.ORG_MANAGE,
    Permission.BILLING_VIEW,
    Permission.BILLING_MANAGE,
    Permission.USER_VIEW,
    Permission.USER_MANAGE,
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_MANAGE,
    Permission.PRODUCT_DELETE,
    Permission.ORDER_VIEW,
    Permission.ORDER_MANAGE,
    Permission.ORDER_DELETE,
  ],
  [OrgRole.MEMBER]: [
    Permission.ORG_VIEW,
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_MANAGE,
    Permission.ORDER_VIEW,
    Permission.ORDER_MANAGE,
  ],
  [OrgRole.VIEWER]: [
    Permission.ORG_VIEW,
    Permission.PRODUCT_VIEW,
    Permission.ORDER_VIEW,
  ],
};

export class RBAC {
  static hasPermission(role: OrgRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
  }
  
  static async getUserRole(userId: string, organizationId: string): Promise<OrgRole> {
    const { prisma } = await import('@/lib/prisma');
    
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
    
    return membership?.role || OrgRole.VIEWER;
  }
  
  static async checkPermission(
    userId: string,
    organizationId: string,
    permission: Permission
  ): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId);
    return this.hasPermission(role, permission);
  }
}
```

## 4. Data Isolation (Row-Level Security)

### Data Isolation Middleware
```typescript
// src/lib/middleware/data-isolation.ts
export async function withDataIsolation(handler: any) {
  return async (req: Request, ...args: any[]) => {
    const session = await getSession(req);
    
    if (!session?.organizationId) {
      throw new AuthError('No organization context');
    }
    
    // Inject organization context into request
    const reqWithOrg = {
      ...req,
      organizationId: session.organizationId,
      userId: session.userId,
    };
    
    return handler(reqWithOrg, ...args);
  };
}
```

### Prisma Query Scoping
```typescript
// src/lib/prisma/isolation.ts
import { prisma } from '@/lib/prisma';

export class IsolatedPrisma {
  static organization(organizationId: string) {
    return {
      products: prisma.product.findMany({
        where: { organizationId },
      }),
      orders: prisma.order.findMany({
        where: { organizationId },
      }),
      customers: prisma.customer.findMany({
        where: { organizationId },
      }),
    };
  }
}
```

## 5. Audit Logging Service

### Audit Logger
```typescript
// src/lib/saas/audit-logger.ts
export class AuditLogger {
  static async log(params: {
    organizationId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: any;
  }) {
    const { prisma } = await import('@/lib/prisma');
    
    const log = await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata,
        ipAddress: params.metadata?.ipAddress,
        userAgent: params.metadata?.userAgent,
      },
    });
    
    return log;
  }
  
  static async getAuditLogs(organizationId: string, options?: {
    action?: string;
    entityType?: string;
    limit?: number;
    offset?: number;
  }) {
    const { prisma } = await import('@/lib/prisma');
    
    const logs = await prisma.auditLog.findMany({
      where: {
        organizationId,
        action: options?.action,
        entityType: options?.entityType,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
    
    return logs;
  }
}
```

## 6. Security Monitoring

### Security Event Types
```typescript
// src/lib/saas/security-events.ts
export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  // Authorization events
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_CHANGE = 'ROLE_CHANGE',
  
  // Data access events
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_DELETION = 'DATA_DELETION',
  
  // Suspicious activity
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

### Security Monitor
```typescript
// src/lib/saas/security-monitor.ts
export class SecurityMonitor {
  static async logEvent(params: {
    organizationId: string;
    userId?: string;
    eventType: SecurityEventType;
    metadata?: any;
  }) {
    // Log security event
    await AuditLogger.log({
      organizationId: params.organizationId,
      userId: params.userId,
      action: params.eventType,
      entityType: 'SECURITY_EVENT',
      metadata: params.metadata,
    });
    
    // Check for suspicious patterns
    await this.checkSuspiciousActivity(params);
  }
  
  static async checkSuspiciousActivity(params: {
    organizationId: string;
    userId?: string;
    eventType: SecurityEventType;
  }) {
    const { prisma } = await import('@/lib/prisma');
    
    // Check for multiple failed logins
    if (params.eventType === SecurityEventType.LOGIN_FAILURE) {
      const recentFailures = await prisma.auditLog.count({
        where: {
          action: SecurityEventType.LOGIN_FAILURE,
          userId: params.userId,
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
          },
        },
      });
      
      if (recentFailures >= 5) {
        // Trigger alert
        await this.sendSecurityAlert({
          type: 'MULTIPLE_LOGIN_FAILURES',
          userId: params.userId,
          organizationId: params.organizationId,
        });
      }
    }
  }
  
  static async sendSecurityAlert(alert: any) {
    // Send alert to security team
    // Implement alerting logic (email, Slack, PagerDuty, etc.)
  }
}
```

## 7. API Endpoints

### Audit Logs
```typescript
// GET /api/saas/audit-logs
interface GetAuditLogsRequest {
  action?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}

interface GetAuditLogsResponse {
  success: boolean;
  logs: AuditLog[];
}
```

### Security Events
```typescript
// GET /api/saas/security-events
interface GetSecurityEventsResponse {
  success: boolean;
  events: SecurityEvent[];
}
```

## 8. Middleware Integration

### RBAC Middleware
```typescript
// src/lib/middleware/rbac.ts
export function requirePermission(permission: Permission) {
  return async ({ session }: { session: any }) => {
    const { RBAC } = await import('@/lib/saas/rbac');
    
    const hasPermission = await RBAC.checkPermission(
      session.userId,
      session.organizationId,
      permission
    );
    
    if (!hasPermission) {
      throw new AuthError('Permission denied');
    }
    
    return true;
  };
}
```

### Audit Middleware
```typescript
// src/lib/middleware/audit.ts
export function withAudit(action: string, entityType: string) {
  return async ({ req, session, result }: any) => {
    const { AuditLogger } = await import('@/lib/saas/audit-logger');
    
    await AuditLogger.log({
      organizationId: session.organizationId,
      userId: session.userId,
      action,
      entityType,
      metadata: {
        ipAddress: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
      },
    });
    
    return result;
  };
}
```

## 9. Frontend Integration

### Audit Logs Dashboard
```typescript
// /admin/audit-logs
- Audit log list
- Filter by action
- Filter by entity type
- Filter by date range
- Export logs
```

### Security Dashboard
```typescript
// /admin/security
- Security events list
- Suspicious activity alerts
- Login history
- Permission changes
- Security metrics
```

## 10. Performance Considerations

### Audit Logging Performance
- Async audit logging
- Batch audit log writes
- Indexed queries on audit logs
- Audit log retention policy

### RBAC Performance
- Cached role permissions
- Cached user roles
- Optimized permission checks
- Role-based query optimization

## 11. Security Considerations

### Data Privacy
- Encrypted audit logs
- PII redaction in logs
- Secure log storage
- Log access control

### Compliance
- GDPR compliance
- SOC 2 compliance
- Data retention policies
- Right to be forgotten

## 12. Deployment Strategy

### Pre-Deployment
- [ ] RBAC system deployed
- [ ] Data isolation middleware deployed
- [ ] Audit logger deployed
- [ ] Security monitor deployed
- [ ] Audit log retention configured

### Deployment
- [ ] Deploy RBAC system
- [ ] Deploy data isolation
- [ ] Deploy audit logger
- [ ] Deploy security monitor
- [ ] Configure retention

### Post-Deployment
- [ ] Verify RBAC checks
- [ ] Verify data isolation
- [ ] Verify audit logging
- [ ] Verify security monitoring
- [ ] Monitor security metrics
