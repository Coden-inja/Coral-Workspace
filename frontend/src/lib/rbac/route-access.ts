import type { UserRole } from "@/contracts/auth";

export type RouteAccessRule = {
  prefix: string;
  roles: UserRole[];
};

export const RESTRICTED_ROUTE_ACCESS: RouteAccessRule[] = [
  { prefix: "/ai-analysis", roles: ["admin", "analyst"] },
  { prefix: "/agents", roles: ["admin", "analyst"] },
  { prefix: "/users", roles: ["admin"] },
  { prefix: "/settings", roles: ["admin"] },
];

export function normalizeRoutePath(pathname: string): string {
  if (pathname === "/") return "/overview";
  return pathname;
}
