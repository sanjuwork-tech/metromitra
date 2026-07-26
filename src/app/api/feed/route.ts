// GET /api/feed — list posts (global or station-scoped). Public read.
// POST /api/feed — create a post. Requires session.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postSchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stationId = url.searchParams.get("stationId");
  const tag = url.searchParams.get("tag");
  const sort = url.searchParams.get("sort") ?? "latest";

  const where: any = {};
  if (stationId) where.stationId = stationId;
  if (tag) where.tag = tag;

  const posts = await db.post.findMany({
    where,
    orderBy: sort === "replies" ? { replies: { _count: "desc" } } : { createdAt: "desc" },
    take: 40,
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true },
      },
      station: { select: { id: true, code: true, name: true, city: true } },
      _count: { select: { replies: true } },
    },
  });
  return NextResponse.json(ok(posts));
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in to post"), { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json(err("Invalid JSON"), { status: 400 });
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const { body: text, stationId, tag, imageUrl } = parsed.data;
  if (stationId) {
    const st = await db.station.findUnique({ where: { id: stationId } });
    if (!st) return NextResponse.json(err("Invalid station"), { status: 400 });
  }

  const post = await db.post.create({
    data: {
      authorId: session.user.id,
      body: text,
      stationId: stationId ?? null,
      tag,
      imageUrl: imageUrl ?? null,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      station: { select: { id: true, code: true, name: true, city: true } },
    },
  });
  return NextResponse.json(ok(post), { status: 201 });
}
