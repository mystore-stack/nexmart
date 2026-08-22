import { requireAuthInternal, getSession, AuthError } from "@/lib/auth-api";
import { CmsPermission, hasCmsPermission, canAccessCms } from "@/lib/cms/rbac";
import type { Role } from "@prisma/client";

export async function requireCmsAccess() {
  const session = await requireAuthInternal();
  const role = session.role as Role;

  if (!canAccessCms(role)) {
    throw new AuthError("CMS access denied", 403, "CMS_FORBIDDEN");
  }

  return session;
}

export async function requireCmsPermission(permission: CmsPermission) {
  const session = await requireCmsAccess();
  const role = session.role as Role;

  if (!hasCmsPermission(role, permission)) {
    throw new AuthError(`Missing CMS permission: ${permission}`, 403, "CMS_PERMISSION_DENIED");
  }

  return session;
}

export async function getCmsSession() {
  const session = await getSession();
  if (!session) return null;

  const role = session.role as Role;
  if (!canAccessCms(role)) return null;

  return {
    ...session,
    permissions: Object.values(CmsPermission).filter((p) => hasCmsPermission(role, p)),
  };
}
