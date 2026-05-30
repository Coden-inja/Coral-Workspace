"use client";

import { useMemo, type ReactNode } from "react";

import { RouteAccessGuard } from "@/components/rbac/route-access-guard";
import { DashboardShell } from "@/components/shell/dashboard-shell";
import type { TopbarMetric } from "@/components/shell/topbar";
import { StatusBadge } from "@/components/shared/status-badge";
import type { UserRole } from "@/contracts/auth";
import { useAuth } from "@/hooks/use-auth";
import { getNavItemsForRole } from "@/lib/rbac";
import type { StatusTone } from "@/types/common";

type OpsDashboardShellProps = {
  children: ReactNode;
  metrics: TopbarMetric[];
  workspaceName?: string;
  topbarTitle?: string;
  environment?: string;
};

const ROLE_BADGE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  analyst: "Analyst",
  viewer: "Viewer",
};

const ROLE_BADGE_TONES: Record<UserRole, StatusTone> = {
  admin: "neutral",
  analyst: "neutral",
  viewer: "neutral",
};

export function OpsDashboardShell({
  children,
  metrics,
  workspaceName = "CoralOps SOC",
  topbarTitle = "CoralOps Investigation Operations",
  environment = "Production",
}: OpsDashboardShellProps) {
  const { role } = useAuth();
  const navItems = useMemo(() => getNavItemsForRole(role), [role]);

  const topbarActions = role ? (
    <StatusBadge
      label={ROLE_BADGE_LABELS[role]}
      tone={ROLE_BADGE_TONES[role]}
      size="sm"
      className="normal-case tracking-normal text-zinc-500"
    />
  ) : null;

  const sidebarRoleLabel = role ? ROLE_BADGE_LABELS[role].toUpperCase() : undefined;

  return (
    <DashboardShell
      navItems={navItems}
      workspaceName={workspaceName}
      topbarTitle={topbarTitle}
      environment={environment}
      roleLabel={sidebarRoleLabel}
      metrics={metrics}
      topbarActions={topbarActions}
    >
      <RouteAccessGuard>{children}</RouteAccessGuard>
    </DashboardShell>
  );
}
