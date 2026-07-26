// PATCH /api/carpools/[id]/join/[jid] — accept/decline a join request (author only).
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; jid: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in"), { status: 401 });
  }
  const { id, jid } = await params;
  const carpool = await db.carpool.findUnique({ where: { id } });
  if (!carpool) return NextResponse.json(err("Carpool not found"), { status: 404 });
  if (carpool.authorId !== session.user.id) {
    return NextResponse.json(err("Only the author can manage join requests"), { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const status = String(body?.status ?? "");
  if (!["accepted", "declined"].includes(status)) {
    return NextResponse.json(err("Invalid status"), { status: 400 });
  }
  const updated = await db.carpoolJoin.update({ where: { id: jid }, data: { status } });
  if (status === "accepted") {
    await db.carpool.update({ where: { id }, data: { status: "matched" } });
  }
  return NextResponse.json(ok(updated));
}
