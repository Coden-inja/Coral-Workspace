"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import type { LoginCredentials, RegisterInput, User, UserRole } from "@/contracts/auth";
import { readAuthSession, writeAuthSession } from "@/lib/auth/session-storage";
import { mockLogin, mockRegister } from "@/services/mock/auth";

type AuthContextValue = {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(readAuthSession());
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const authenticatedUser = await mockLogin(credentials);
    writeAuthSession(authenticatedUser);
    setUser(authenticatedUser);
    setIsLoading(false);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const registeredUser = await mockRegister(input);
    writeAuthSession(registeredUser);
    setUser(registeredUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    writeAuthSession(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
