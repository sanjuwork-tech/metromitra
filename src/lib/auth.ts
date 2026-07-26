// NextAuth.js v4 configuration for MetroMitra.
// Credentials provider with scrypt-hashed passwords (see lib/password.ts).
// JWT session strategy — stateless, Vercel-friendly.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "MetroMitra",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            trustScore: true,
            verifiedBadge: true,
            homeStationId: true,
            avatarUrl: true,
          },
        });
        if (!user) return null;
        const valid = verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          trustScore: user.trustScore,
          verifiedBadge: user.verifiedBadge,
          homeStationId: user.homeStationId,
          avatarUrl: user.avatarUrl,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.trustScore = (user as any).trustScore;
        token.verifiedBadge = (user as any).verifiedBadge;
        token.homeStationId = (user as any).homeStationId;
        token.avatarUrl = (user as any).avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).trustScore = token.trustScore;
        (session.user as any).verifiedBadge = token.verifiedBadge;
        (session.user as any).homeStationId = token.homeStationId;
        (session.user as any).avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
};

export type AppSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    trustScore: number;
    verifiedBadge: boolean;
    homeStationId?: string | null;
    avatarUrl?: string | null;
  };
};
