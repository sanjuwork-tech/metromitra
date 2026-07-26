// Server-side session helper for Route Handlers.
import { getServerSession } from "next-auth";
import { authOptions, type AppSession } from "@/lib/auth";

export async function getSession(): Promise<AppSession | null> {
  const s = await getServerSession(authOptions);
  return s as AppSession | null;
}

export async function requireSession(): Promise<AppSession> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}
