"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
};

type SidebarProps = {
  items: SidebarNavItem[];
  workspaceName?: string;
  activeItemId?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const baseItemClass =
  "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors";

export function Sidebar({
  items,
  workspaceName = "CoralOps Workspace",
  activeItemId,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      <aside className="hidden h-screen w-72 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
        <SidebarContent
          items={items}
          workspaceName={workspaceName}
          activeItemId={activeItemId}
        />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onCloseMobile} />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-800 bg-zinc-950 transition-transform lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <SidebarContent
          items={items}
          workspaceName={workspaceName}
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
  activeItemId?: string;
  onCloseMobile?: () => void;
};

function SidebarContent({
  items,
  workspaceName,
  activeItemId,
  onCloseMobile,
}: SidebarContentProps) {
  const pathname = usePathname();

  const isItemActive = (item: SidebarNavItem) => {
    if (activeItemId) return item.id === activeItemId;
    if (item.href === "/overview") return pathname === "/overview" || pathname === "/";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-4">
        <p className="text-xs uppercase tracking-wide text-zinc-400">Workspace</p>
        <p className="mt-1 truncate text-sm font-medium text-zinc-100">{workspaceName}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {items.map((item) => {
          const isActive = isItemActive(item);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onCloseMobile}
              className={[
                baseItemClass,
                isActive
                  ? "border border-zinc-700 bg-zinc-800 text-zinc-100"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
              ].join(" ")}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-zinc-400">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </span>

              {item.badge ? (
                <span className="rounded-md border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 px-4 py-3">
        <p className="text-xs text-zinc-500">Enterprise AI Operations Infrastructure</p>
      </div>
    </div>
  );
}
