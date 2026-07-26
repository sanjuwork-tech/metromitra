// POST /api/feed/[id]/reply — reply to a post.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { replySchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in to reply"), { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json(err("Invalid JSON"), { status: 400 });
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const post = await db.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json(err("Post not found"), { status: 404 });

  const reply = await db.reply.create({
    data: { postId: id, authorId: session.user.id, body: parsed.data.body },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true } },
    },
  });
  return NextResponse.json(ok(reply), { status: 201 });
}
