"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthField, AuthInput } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import type { UserRole } from "@/contracts/auth";
import { USER_ROLES } from "@/contracts/auth";
import { useAuth } from "@/hooks/use-auth";
import { validateRegister, type FieldErrors } from "@/lib/auth/validate-credentials";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  analyst: "Analyst",
  viewer: "Viewer",
};

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("analyst");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateRegister({ name, email, password, role });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setLoading(true);

    try {
      await register({ name, email, password, role });
      router.push("/overview");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your CoralTeams account"
      description="Register for secure access to investigation operations."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-400 transition-colors hover:text-blue-300">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="rounded-md border border-red-800/70 bg-red-950/35 px-3 py-2 text-xs text-red-200">{formError}</div>
        ) : null}

        <AuthField label="Full Name" error={fieldErrors.name}>
          <AuthInput
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Analyst Lin"
            value={name}
            onChange={(event) => setName(event.target.value)}
            hasError={Boolean(fieldErrors.name)}
            disabled={loading}
          />
        </AuthField>

        <AuthField label="Email" error={fieldErrors.email}>
          <AuthInput
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@coralteams.io"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            hasError={Boolean(fieldErrors.email)}
            disabled={loading}
          />
        </AuthField>

        <PasswordField
          label="Password"
          id="register-password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          disabled={loading}
        />

        <AuthField label="Role" error={fieldErrors.role}>
          <select
            id="register-role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            disabled={loading}
            className={[
              "h-10 w-full rounded-md border bg-zinc-950 px-3 text-sm text-zinc-200 outline-none focus:border-blue-600",
              fieldErrors.role ? "border-red-800/80" : "border-zinc-700",
            ].join(" ")}
          >
            {USER_ROLES.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
        </AuthField>

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center rounded-md border border-blue-700/70 bg-blue-950/50 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-900/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
