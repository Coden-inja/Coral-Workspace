import type { ReactNode } from "react";

import { GuestRoute } from "@/components/auth/guest-route";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <GuestRoute>{children}</GuestRoute>;
}
