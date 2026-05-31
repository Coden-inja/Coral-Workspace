"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthField, AuthInput } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { useAuth } from "@/hooks/use-auth";
import { validateLogin, type FieldErrors } from "@/lib/auth/validate-credentials";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateLogin({ email, password });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/overview");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in to CoralOps"
      description="Access your investigation operations workspace."
      footer={
        <p>
          Need an account?{" "}
          <Link href="/register" className="font-medium text-blue-400 transition-colors hover:text-blue-300">
            Create one
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="rounded-md border border-red-800/70 bg-red-950/35 px-3 py-2 text-xs text-red-200">{formError}</div>
        ) : null}

        <AuthField label="Email" error={fieldErrors.email}>
          <AuthInput
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@coralops.io"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            hasError={Boolean(fieldErrors.email)}
            disabled={loading}
          />
        </AuthField>

        <PasswordField
          label="Password"
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center rounded-md border border-blue-700/70 bg-blue-950/50 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-900/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
