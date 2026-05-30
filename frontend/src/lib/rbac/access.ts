import type { UserRole } from "@/contracts/auth";

import { normalizeRoutePath, RESTRICTED_ROUTE_ACCESS } from "@/lib/rbac/route-access";

export function hasRole(userRole: UserRole | null, role: UserRole): boolean {
  return userRole === role;
}

export function hasAnyRole(userRole: UserRole | null, roles: readonly UserRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

export function canAccessRoute(userRole: UserRole | null, pathname: string): boolean {
  if (!userRole) return false;

  const path = normalizeRoutePath(pathname);

  for (const rule of RESTRICTED_ROUTE_ACCESS) {
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) {
      return rule.roles.includes(userRole);
    }
  }

  return true;
}
