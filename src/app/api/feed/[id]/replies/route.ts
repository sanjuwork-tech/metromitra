// GET /api/feed/[id]/replies — list replies for a post. Public.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const replies = await db.reply.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
    },
  });
  return NextResponse.json(ok(replies));
}
