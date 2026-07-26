"use client";
// Typed useSession wrapper exposing our enriched session fields.
import { useSession as useNextAuthSession } from "next-auth/react";
import type { AppSession } from "@/lib/auth";

export function useSession() {
  return useNextAuthSession() as ReturnType<typeof useNextAuthSession> & {
    data: AppSession | null;
  };
}
