// GET /api/me — current user's full profile (for the dashboard).
// PATCH /api/me — update own profile.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profileUpdateSchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";
import { recomputeTrust } from "@/lib/trust";

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in"), { status: 401 });
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      city: true,
      avatarUrl: true,
      trustScore: true,
      verifiedBadge: true,
      preferredLang: true,
      travelWindow: true,
      homeStation: { select: { id: true, code: true, name: true, city: true } },
      workStation: { select: { id: true, code: true, name: true, city: true } },
      createdAt: true,
    },
  });
  if (!user) return NextResponse.json(err("User not found"), { status: 404 });
  return NextResponse.json(ok(user));
}

export async function PATCH(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in"), { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json(err("Invalid JSON"), { status: 400 });
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio ?? null,
      homeStationId: parsed.data.homeStationId ?? null,
      workStationId: parsed.data.workStationId ?? null,
      travelWindow: parsed.data.travelWindow ?? null,
      preferredLang: parsed.data.preferredLang ?? "en",
      city: parsed.data.city ?? null,
      avatarUrl: parsed.data.avatarUrl ?? null,
    },
    select: {
      id: true, name: true, bio: true, city: true, avatarUrl: true,
      trustScore: true, verifiedBadge: true, preferredLang: true, travelWindow: true,
      homeStation: { select: { id: true, code: true, name: true, city: true } },
      workStation: { select: { id: true, code: true, name: true, city: true } },
    },
  });
  await recomputeTrust(session.user.id);
  return NextResponse.json(ok(updated));
}
