"use client";
import { useAuth } from "@/lib/auth-client";

// Drop-in replacement for the old NextAuth useSession hook shape.
export function useSession() {
  const { user, status } = useAuth();
  return { data: user ? { user } : null, status };
}
