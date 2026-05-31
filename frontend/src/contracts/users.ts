import type { UserRole } from "@/contracts/auth";
import type { StatusTone } from "@/types/common";

export type PlatformUserStatus = "Active" | "Inactive";

export type PlatformUserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  status: PlatformUserStatus;
  statusTone: StatusTone;
};

export type UsersPageMetric = {
  id: string;
  label: string;
  value: string;
};

export type UsersPageSnapshot = {
  metrics: UsersPageMetric[];
  users: PlatformUserRecord[];
};
