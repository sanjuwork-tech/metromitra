// GET /api/carpools — list carpools. Public read.
// POST /api/carpools — create a carpool. Requires session.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { carpoolSchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stationId = url.searchParams.get("stationId");
  const status = url.searchParams.get("status") ?? "open";
  const type = url.searchParams.get("type");

  const where: any = { status };
  if (stationId) where.originStationId = stationId;
  if (type) where.type = type;

  const carpools = await db.carpool.findMany({
    where,
    orderBy: { departAt: "asc" },
    take: 40,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      originStation: { select: { id: true, code: true, name: true, city: true } },
      _count: { select: { joins: { where: { status: "accepted" } } } },
    },
  });
  return NextResponse.json(ok(carpools));
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in to post a ride"), { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json(err("Invalid JSON"), { status: 400 });
  const parsed = carpoolSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const { type, originStationId, destinationArea, departAt, seats, mode, costSplit, womenOnly, notes } = parsed.data;
  const station = await db.station.findUnique({ where: { id: originStationId } });
  if (!station) return NextResponse.json(err("Invalid station"), { status: 400 });

  const carpool = await db.carpool.create({
    data: {
      authorId: session.user.id,
      type,
      originStationId,
      destinationArea,
      departAt: new Date(departAt),
      seats,
      mode,
      costSplit,
      womenOnly,
      notes: notes ?? null,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      originStation: { select: { id: true, code: true, name: true, city: true } },
    },
  });
  return NextResponse.json(ok(carpool), { status: 201 });
}
