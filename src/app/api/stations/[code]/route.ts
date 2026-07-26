// GET /api/stations/[code] — station detail + aggregates. Public.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const station = await db.station.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!station) return NextResponse.json(err("Station not found"), { status: 404 });

  const [posts, carpools, lostFound, marketplace, members] = await Promise.all([
    db.post.findMany({
      where: { stationId: station.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
        _count: { select: { replies: true } },
      },
    }),
    db.carpool.findMany({
      where: { originStationId: station.id, status: "open" },
      orderBy: { departAt: "asc" },
      take: 6,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      },
    }),
    db.lostFound.findMany({
      where: { stationId: station.id, status: "active" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { id: true, name: true, verifiedBadge: true } },
      },
    }),
    db.marketplace.findMany({
      where: { stationId: station.id, status: "available" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { id: true, name: true, verifiedBadge: true } },
      },
    }),
    db.user.count({
      where: {
        OR: [{ homeStationId: station.id }, { workStationId: station.id }],
      },
    }),
  ]);

  return NextResponse.json(
    ok({ station, stats: { members, posts: posts.length, carpools: carpools.length }, posts, carpools, lostFound, marketplace })
  );
}
