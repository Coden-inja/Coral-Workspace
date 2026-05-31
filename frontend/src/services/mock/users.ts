import type { UsersPageSnapshot } from "@/contracts/users";
import type { StatusTone } from "@/types/common";

const tone = {
  neutral: "neutral",
  healthy: "healthy",
  warning: "warning",
  critical: "critical",
  info: "info",
} satisfies Record<string, StatusTone>;

export function getMockUsersPageSnapshot(): UsersPageSnapshot {
  return {
    metrics: [
      { id: "total", label: "Total Users", value: "3" },
      { id: "active", label: "Active Users", value: "3" },
      { id: "admins", label: "Admins", value: "1" },
      { id: "analysts", label: "Analysts", value: "1" },
    ],
    users: [
      {
        id: "user-admin-1",
        name: "Admin User",
        email: "admin@coralops.io",
        role: "admin",
        roleLabel: "Admin",
        status: "Active",
        statusTone: tone.healthy,
      },
      {
        id: "user-analyst-1",
        name: "Security Analyst",
        email: "analyst@coralops.io",
        role: "analyst",
        roleLabel: "Analyst",
        status: "Active",
        statusTone: tone.healthy,
      },
      {
        id: "user-viewer-1",
        name: "Read Only User",
        email: "viewer@coralops.io",
        role: "viewer",
        roleLabel: "Viewer",
        status: "Inactive",
        statusTone: tone.neutral,
      },
    ],
  };
}
