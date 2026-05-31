"use client";

import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { StatusBadge } from "@/components/shared/status-badge";

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: string;
};

type SidebarProps = {
  items: SidebarNavItem[];
  workspaceName?: string;
  environment?: string;
  roleLabel?: string;
  activeItemId?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const NAV_ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  investigations: ShieldAlert,
  "ai-analysis": BrainCircuit,
  users: Users,
  settings: Settings,
};

const NAV_SECTIONS: { title: string; itemIds: string[] }[] = [
  { title: "Command Center", itemIds: ["overview"] },
  { title: "Investigation Center", itemIds: ["investigations"] },
  { title: "AI Analysis", itemIds: ["ai-analysis"] },
  { title: "Administration", itemIds: ["users", "settings"] },
];

const SIDEBAR_WIDTH = "w-[15.5rem]";

export function Sidebar({
  items,
  workspaceName = "CoralTeams SOC",
  environment = "Production",
  roleLabel,
  activeItemId,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      <aside
        className={[
          "hidden h-screen shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex",
          SIDEBAR_WIDTH,
        ].join(" ")}
      >
        <SidebarContent
          items={items}
          workspaceName={workspaceName}
          environment={environment}
          roleLabel={roleLabel}
          activeItemId={activeItemId}
        />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onCloseMobile} />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-800 bg-zinc-950 transition-transform lg:hidden",
          SIDEBAR_WIDTH,
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <SidebarContent
          items={items}
          workspaceName={workspaceName}
          environment={environment}
          roleLabel={roleLabel}
          activeItemId={activeItemId}
          onCloseMobile={onCloseMobile}
        />
      </aside>
    </>
  );
}

type SidebarContentProps = {
  items: SidebarNavItem[];
  workspaceName: string;
  environment: string;
  roleLabel?: string;
  activeItemId?: string;
  onCloseMobile?: () => void;
};

function SidebarContent({
  items,
  workspaceName,
  environment,
  roleLabel,
  activeItemId,
  onCloseMobile,
}: SidebarContentProps) {
  const pathname = usePathname();

  const isItemActive = (item: SidebarNavItem) => {
    if (activeItemId) return item.id === activeItemId;
    if (item.href === "/overview") return pathname === "/overview" || pathname === "/";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const sections = NAV_SECTIONS.map((section) => ({
    title: section.title,
    items: items.filter((item) => section.itemIds.includes(item.id)),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-zinc-800 px-4 py-3.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
          <span className="text-[11px] font-bold tracking-tight text-blue-400/90">C</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-100">CoralTeams</span>
      </div>

      <div className="border-b border-zinc-800 px-4 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Workspace</p>
        <p className="mt-1.5 text-[13px] font-semibold leading-tight text-zinc-200">{workspaceName}</p>
        <p className="mt-0.5 text-xs leading-tight text-zinc-500">{environment}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {sections.map((section, index) => (
          <div key={section.title} className={index > 0 ? "mt-5" : ""}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = isItemActive(item);
                const Icon = NAV_ICONS[item.id];

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      className={[
                        "flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] leading-none transition-colors",
                        isActive
                          ? "bg-zinc-800/90 font-medium text-zinc-100 ring-1 ring-inset ring-zinc-700/80"
                          : "font-normal text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                      ].join(" ")}
                    >
                      {Icon ? (
                        <Icon
                          className={[
                            "h-4 w-4 shrink-0",
                            isActive ? "text-zinc-200" : "text-zinc-500",
                          ].join(" ")}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      ) : (
                        <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="shrink-0 rounded-md bg-zinc-800/90 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-800 px-4 py-3.5">
        {roleLabel ? (
          <StatusBadge
            label={roleLabel}
            tone="neutral"
            size="sm"
            className="mb-2.5 normal-case tracking-[0.06em] text-zinc-500"
          />
        ) : null}
        <p className="text-[13px] font-medium text-zinc-500/80">CoralTeams</p>
        <p className="mt-0.5 text-[11px] leading-snug text-zinc-600/70">Enterprise AI Operations Infrastructure</p>
      </div>
    </div>
  );
}
