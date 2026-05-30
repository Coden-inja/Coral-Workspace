"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import { useAuth } from "@/hooks/use-auth";
import { canAccessRoute } from "@/lib/rbac";

type RouteAccessGuardProps = {
  children: ReactNode;
};

export function RouteAccessGuard({ children }: RouteAccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isLoading } = useAuth();
  const isAuthorized = role ? canAccessRoute(role, pathname) : false;

  useEffect(() => {
    if (isLoading || isAuthorized) return;
    router.replace("/overview");
  }, [isAuthorized, isLoading, router]);

  if (isLoading || !isAuthorized) {
    return <AuthRouteLoading />;
  }

  return children;
}
