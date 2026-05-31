"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import type { UserRole } from "@/contracts/auth";
import { useAuth } from "@/hooks/use-auth";
import { hasAnyRole } from "@/lib/rbac";

type RoleGuardProps = {
  children: ReactNode;
  roles: readonly UserRole[];
};

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const router = useRouter();
  const { role, isLoading } = useAuth();
  const isAuthorized = hasAnyRole(role, roles);

  useEffect(() => {
    if (isLoading || isAuthorized) return;
    router.replace("/overview");
  }, [isAuthorized, isLoading, router]);

  if (isLoading || !isAuthorized) {
    return <AuthRouteLoading />;
  }

  return children;
}
