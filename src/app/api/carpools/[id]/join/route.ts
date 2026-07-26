// POST /api/carpools/[id]/join — request to join a carpool.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { carpoolJoinSchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in"), { status: 401 });
  }
  const { id } = await params;
  const carpool = await db.carpool.findUnique({ where: { id } });
  if (!carpool) return NextResponse.json(err("Carpool not found"), { status: 404 });
  if (carpool.authorId === session.user.id) {
    return NextResponse.json(err("You can't join your own ride"), { status: 400 });
  }
  if (carpool.status !== "open") {
    return NextResponse.json(err("This ride is no longer open"), { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = carpoolJoinSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const existing = await db.carpoolJoin.findUnique({
    where: { carpoolId_userId: { carpoolId: id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json(err("You already requested to join"), { status: 409 });

  const join = await db.carpoolJoin.create({
    data: {
      carpoolId: id,
      userId: session.user.id,
      message: parsed.data.message ?? null,
    },
  });
  return NextResponse.json(ok(join), { status: 201 });
}
