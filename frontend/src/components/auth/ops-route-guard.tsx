"use client";

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

type OpsRouteGuardProps = {
  children: ReactNode;
};

export function OpsRouteGuard({ children }: OpsRouteGuardProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
