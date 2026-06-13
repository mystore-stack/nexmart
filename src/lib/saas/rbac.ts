// src/lib/saas/rbac.ts
import { prisma } from '@/lib/prisma';

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
