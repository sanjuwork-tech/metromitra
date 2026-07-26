// PATCH /api/carpools/[id] — update carpool status (author only).
// POST /api/carpools/[id]/join — request to join a carpool.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function PATCH(
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
  const body = await req.json().catch(() => ({}));
  const status = String(body?.status ?? "");
  if (!["open", "matched", "completed", "expired"].includes(status)) {
    return NextResponse.json(err("Invalid status"), { status: 400 });
  }
  const carpool = await db.carpool.findUnique({ where: { id } });
  if (!carpool) return NextResponse.json(err("Not found"), { status: 404 });
  if (carpool.authorId !== session.user.id) {
    return NextResponse.json(err("Only the author can update this"), { status: 403 });
  }
  const updated = await db.carpool.update({ where: { id }, data: { status } });
  return NextResponse.json(ok(updated));
}
