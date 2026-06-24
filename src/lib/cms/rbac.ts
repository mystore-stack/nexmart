import type { Role } from "@prisma/client";

export enum CmsPermission {
  CMS_VIEW = "CMS_VIEW",
  CMS_EDIT = "CMS_EDIT",
  CMS_PUBLISH = "CMS_PUBLISH",
  CMS_DELETE = "CMS_DELETE",
  CMS_ANALYTICS = "CMS_ANALYTICS",
  CMS_MEDIA = "CMS_MEDIA",
  CMS_NAVIGATION = "CMS_NAVIGATION",
  CMS_BRANDS = "CMS_BRANDS",
  CMS_CAMPAIGNS = "CMS_CAMPAIGNS",
  CMS_ROLES = "CMS_ROLES",
  CMS_AUDIT = "CMS_AUDIT",
}

export const CMS_ROLE_PERMISSIONS: Record<Role, CmsPermission[]> = {
  USER: [],
  SUPER_ADMIN: Object.values(CmsPermission),
  ADMIN: [
    CmsPermission.CMS_VIEW,
    CmsPermission.CMS_EDIT,
    CmsPermission.CMS_PUBLISH,
    CmsPermission.CMS_DELETE,
    CmsPermission.CMS_ANALYTICS,
    CmsPermission.CMS_MEDIA,
    CmsPermission.CMS_NAVIGATION,
    CmsPermission.CMS_BRANDS,
    CmsPermission.CMS_CAMPAIGNS,
    CmsPermission.CMS_AUDIT,
  ],
  EDITOR: [
    CmsPermission.CMS_VIEW,
    CmsPermission.CMS_EDIT,
    CmsPermission.CMS_MEDIA,
    CmsPermission.CMS_NAVIGATION,
    CmsPermission.CMS_BRANDS,
  ],
  MARKETING_MANAGER: [
    CmsPermission.CMS_VIEW,
    CmsPermission.CMS_EDIT,
    CmsPermission.CMS_PUBLISH,
    CmsPermission.CMS_ANALYTICS,
    CmsPermission.CMS_MEDIA,
    CmsPermission.CMS_CAMPAIGNS,
  ],
};

export const CMS_ROLE_LABELS: Record<Role, string> = {
  USER: "User",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  MARKETING_MANAGER: "Marketing Manager",
};

export function hasCmsPermission(role: Role, permission: CmsPermission): boolean {
  return CMS_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessCms(role: Role): boolean {
  return CMS_ROLE_PERMISSIONS[role]?.length > 0;
}

export function getCmsPermissions(role: Role): CmsPermission[] {
  return CMS_ROLE_PERMISSIONS[role] ?? [];
}

export const CMS_ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "MARKETING_MANAGER",
];
