import type { LoginCredentials, RegisterInput, UserRole } from "@/contracts/auth";
import { USER_ROLES } from "@/contracts/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Partial<Record<string, string>>;

export function validateLogin(credentials: LoginCredentials): FieldErrors {
  const errors: FieldErrors = {};
  const email = credentials.email.trim();
  const password = credentials.password;

  if (email.length === 0) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (password.length === 0) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateRegister(input: RegisterInput): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const password = input.password;

  if (name.length === 0) {
    errors.name = "Full name is required.";
  }

  if (email.length === 0) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (password.length === 0) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (input.role && !(USER_ROLES as readonly string[]).includes(input.role)) {
    errors.role = "Select a valid role.";
  }

  return errors;
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
