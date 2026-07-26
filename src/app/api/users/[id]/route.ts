// GET /api/users/[id] — public profile + trust + recent activity.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
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

  const [postCount, carpoolCount, ratingCount] = await Promise.all([
    db.post.count({ where: { authorId: id } }),
    db.carpool.count({ where: { authorId: id } }),
    db.rating.count({ where: { ratedId: id } }),
  ]);

  const recentRatings = await db.rating.findMany({
    where: { ratedId: id, note: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { score: true, note: true, createdAt: true },
  });

  return NextResponse.json(
    ok({ ...user, stats: { posts: postCount, carpools: carpoolCount, ratings: ratingCount }, recentRatings })
  );
}
