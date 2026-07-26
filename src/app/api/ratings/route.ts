// POST /api/ratings — rate a user after a completed interaction.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ratingSchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";
import { recomputeTrust } from "@/lib/trust";

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in"), { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json(err("Invalid JSON"), { status: 400 });
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const { ratedId, contextType, contextId, score, note } = parsed.data;
  if (ratedId === session.user.id) {
    return NextResponse.json(err("You can't rate yourself"), { status: 400 });
  }
  const rated = await db.user.findUnique({ where: { id: ratedId } });
  if (!rated) return NextResponse.json(err("User not found"), { status: 404 });

  try {
    const rating = await db.rating.create({
      data: {
        raterId: session.user.id,
        ratedId,
        contextType,
        contextId,
        score,
        note: note ?? null,
      },
    });
    await recomputeTrust(ratedId);
    return NextResponse.json(ok(rating), { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(err("You already rated this interaction"), { status: 409 });
    }
    throw e;
  }
}
