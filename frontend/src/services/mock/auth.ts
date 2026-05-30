import type { LoginCredentials, RegisterInput, User } from "@/contracts/auth";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MOCK_USERS: User[] = [
  {
    id: "user-admin-1",
    email: "admin@coralops.io",
    name: "SOC Admin",
    role: "admin",
  },
  {
    id: "user-analyst-1",
    email: "analyst@coralops.io",
    name: "Analyst Lin",
    role: "analyst",
  },
  {
    id: "user-viewer-1",
    email: "viewer@coralops.io",
    name: "Operations Viewer",
    role: "viewer",
  },
];

export async function mockLogin(credentials: LoginCredentials): Promise<User> {
  await delay(180);

  const normalizedEmail = credentials.email.trim().toLowerCase();
  const matchedUser = MOCK_USERS.find((user) => user.email.toLowerCase() === normalizedEmail);

  if (!matchedUser || credentials.password.trim().length === 0) {
    throw new Error("Invalid email or password.");
  }

  return matchedUser;
}

export async function mockRegister(input: RegisterInput): Promise<User> {
  await delay(220);

  const normalizedEmail = input.email.trim().toLowerCase();
  if (normalizedEmail.length === 0 || input.password.trim().length === 0 || input.name.trim().length === 0) {
    throw new Error("Registration requires email, password, and name.");
  }

  const existingUser = MOCK_USERS.find((user) => user.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  return {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    name: input.name.trim(),
    role: input.role ?? "analyst",
  };
}
