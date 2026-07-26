// GET /api/buddies — list travel buddy requests. Public read.
// POST /api/buddies — create a buddy request. Requires session.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buddySchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stationId = url.searchParams.get("stationId");
  const status = url.searchParams.get("status") ?? "open";
  const womenOnly = url.searchParams.get("womenOnly");

  const where: any = { status };
  if (stationId) where.originStationId = stationId;
  if (womenOnly === "true") where.womenOnly = true;

  const buddies = await db.buddyRequest.findMany({
    where,
    orderBy: { travelAt: "asc" },
    take: 40,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      originStation: { select: { id: true, code: true, name: true, city: true } },
      destStation: { select: { id: true, code: true, name: true, city: true } },
    },
  });
  return NextResponse.json(ok(buddies));
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in"), { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json(err("Invalid JSON"), { status: 400 });
  const parsed = buddySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const { originStationId, destStationId, travelAt, womenOnly, notes } = parsed.data;
  const origin = await db.station.findUnique({ where: { id: originStationId } });
  if (!origin) return NextResponse.json(err("Invalid origin station"), { status: 400 });

  const buddy = await db.buddyRequest.create({
    data: {
      userId: session.user.id,
      originStationId,
      destStationId: destStationId ?? null,
      travelAt: new Date(travelAt),
      womenOnly,
      notes: notes ?? null,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      originStation: { select: { id: true, code: true, name: true, city: true } },
      destStation: { select: { id: true, code: true, name: true, city: true } },
    },
  });
  return NextResponse.json(ok(buddy), { status: 201 });
}
