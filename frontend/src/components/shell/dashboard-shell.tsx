"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Sidebar, type SidebarNavItem } from "@/components/shell/sidebar";
import { Topbar, type TopbarMetric } from "@/components/shell/topbar";

type DashboardShellProps = {
  children: ReactNode;
  navItems?: SidebarNavItem[];
  metrics?: TopbarMetric[];
  workspaceName?: string;
  activeItemId?: string;
  topbarTitle?: string;
  environment?: string;
  roleLabel?: string;
  topbarActions?: ReactNode;
};

const defaultNavItems: SidebarNavItem[] = [
  { id: "overview", label: "Overview", href: "/overview" },
  { id: "investigations", label: "Investigations", href: "/investigations", badge: "3" },
  { id: "agents", label: "Agents", href: "/agents", badge: "3" },
  { id: "connectors", label: "Connectors", href: "/connectors", badge: "6" },
  { id: "workspaces", label: "Workspaces", href: "/workspaces" },
];

const defaultMetrics: TopbarMetric[] = [
  { id: "ingest", label: "Ingest", value: "Normal", tone: "healthy" },
  { id: "alerts", label: "Alerts", value: "4", tone: "warning" },
  { id: "latency", label: "p95", value: "210ms", tone: "default" },
  { id: "incidents", label: "Incidents", value: "1 Open", tone: "critical" },
];

export function DashboardShell({
  children,
  navItems,
  metrics,
  workspaceName,
  activeItemId = "overview",
  topbarTitle,
  environment,
  roleLabel,
  topbarActions,
}: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const resolvedNavItems = useMemo(() => navItems ?? defaultNavItems, [navItems]);
  const resolvedMetrics = useMemo(() => metrics ?? defaultMetrics, [metrics]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <Sidebar
          items={resolvedNavItems}
          workspaceName={workspaceName}
          environment={environment}
          roleLabel={roleLabel}
          activeItemId={activeItemId}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            title={topbarTitle}
            environment={environment}
            metrics={resolvedMetrics}
            onMenuClick={() => setIsMobileSidebarOpen((prev) => !prev)}
            actions={topbarActions}
          />

          <main className="flex-1 p-4 lg:p-6">
            <section className="min-h-full rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4 lg:p-6">
              {children}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
