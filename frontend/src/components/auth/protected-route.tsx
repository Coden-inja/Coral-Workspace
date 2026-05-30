"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import { useAuth } from "@/hooks/use-auth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    router.replace("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AuthRouteLoading />;
  }

  if (!isAuthenticated) {
    return <AuthRouteLoading />;
  }

  return children;
}
