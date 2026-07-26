// Registration endpoint — creates a user with a scrypt-hashed password.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema, ok, err, zodErrors } from "@/lib/validators";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json(err("Invalid JSON"), { status: 400 });

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });
  }
  const { name, email, password, city } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json(err("An account with this email already exists"), { status: 409 });
  }

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      city: city ?? null,
      trustScore: 0,
    },
    select: { id: true, email: true, name: true },
  });
  return NextResponse.json(ok(user), { status: 201 });
}
