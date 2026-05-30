"use client";

import { AdminDashboard } from "@/components/admin-dashboard/admin-dashboard";
import { AnalystDashboard } from "@/components/overview/analyst-dashboard";
import { ViewerDashboard } from "@/components/overview/viewer-dashboard";
import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import type { AdminDashboardSnapshot } from "@/contracts/admin-dashboard";
import type { CommandCenterSnapshot, InvestigationSummary } from "@/contracts";
import { useAuth } from "@/hooks/use-auth";

type OverviewDashboardRouterProps = {
  adminSnapshot: AdminDashboardSnapshot;
  commandSnapshot: CommandCenterSnapshot;
  incidents: InvestigationSummary[];
};

export function OverviewDashboardRouter({
  adminSnapshot,
  commandSnapshot,
  incidents,
}: OverviewDashboardRouterProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return <AuthRouteLoading />;
  }

  if (role === "admin") {
    return <AdminDashboard snapshot={adminSnapshot} />;
  }

  if (role === "analyst") {
    return <AnalystDashboard snapshot={commandSnapshot} incidents={incidents} />;
  }

  if (role === "viewer") {
    return <ViewerDashboard snapshot={commandSnapshot} incidents={incidents} />;
  }

  return <AuthRouteLoading />;
}
