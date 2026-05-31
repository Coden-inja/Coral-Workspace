import type { User } from "@/contracts/auth";
import { USER_ROLES } from "@/contracts/auth";

const AUTH_STORAGE_KEY = "coralops.auth.session";

function isUserRole(value: unknown): value is User["role"] {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    isUserRole(candidate.role)
  );
}

export function readAuthSession(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeAuthSession(user: User | null): void {
  if (typeof window === "undefined") return;

  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
