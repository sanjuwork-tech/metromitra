"use client";
// Client-side demo auth context. Replaces NextAuth.
// Uses the Zustand store; persists to localStorage.
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useStore, useCurrentUser, type User } from "@/lib/store";

type AuthContextValue = {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  register: (name: string, email: string, password: string, city?: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const register = useStore((s) => s.register);
  const login = useStore((s) => s.login);
  const logout = useStore((s) => s.logout);
  const updateProfile = useStore((s) => s.updateProfile);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status: user ? "authenticated" : "unauthenticated",
    register, login, logout, updateProfile,
  }), [user, register, login, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
