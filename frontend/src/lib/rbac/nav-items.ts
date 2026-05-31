import type { SidebarNavItem } from "@/components/shell/sidebar";
import type { UserRole } from "@/contracts/auth";

export type RbacNavItem = SidebarNavItem & {
  roles: UserRole[];
};

export const RBAC_NAV_ITEMS: RbacNavItem[] = [
  {
    id: "overview",
    label: "Dashboard",
    href: "/overview",
    roles: ["admin", "analyst", "viewer"],
  },
  {
    id: "investigations",
    label: "Investigations",
    href: "/investigations",
    badge: "3",
    roles: ["admin", "analyst", "viewer"],
  },
  {
    id: "ai-analysis",
    label: "AI Analysis",
    href: "/ai-analysis",
    badge: "3",
    roles: ["admin", "analyst"],
  },
  {
    id: "users",
    label: "Users",
    href: "/users",
    roles: ["admin"],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    roles: ["admin"],
  },
];

export function getNavItemsForRole(role: UserRole | null): SidebarNavItem[] {
  if (!role) return [];

  return RBAC_NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    badge: item.badge,
  }));
}
