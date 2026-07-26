// GET /api/marketplace — list listings. Public read.
// POST /api/marketplace — create. Requires session.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { marketplaceSchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stationId = url.searchParams.get("stationId");
  const category = url.searchParams.get("category");

  const where: any = { status: "available" };
  if (stationId) where.stationId = stationId;
  if (category) where.category = category;

  const items = await db.marketplace.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      station: { select: { id: true, code: true, name: true, city: true } },
    },
  });
  return NextResponse.json(ok(items));
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
  const parsed = marketplaceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const { title, description, price, category, condition, stationId, imageUrl } = parsed.data;
  const station = await db.station.findUnique({ where: { id: stationId } });
  if (!station) return NextResponse.json(err("Invalid station"), { status: 400 });

  const item = await db.marketplace.create({
    data: {
      userId: session.user.id,
      title,
      description,
      price,
      category,
      condition,
      stationId,
      imageUrl: imageUrl ?? null,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      station: { select: { id: true, code: true, name: true, city: true } },
    },
  });
  return NextResponse.json(ok(item), { status: 201 });
}
