// PATCH /api/marketplace/[id] — update status (author only).
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
  if (!["available", "reserved", "sold"].includes(status)) {
    return NextResponse.json(err("Invalid status"), { status: 400 });
  }
  const item = await db.marketplace.findUnique({ where: { id } });
  if (!item) return NextResponse.json(err("Not found"), { status: 404 });
  if (item.userId !== session.user.id) {
    return NextResponse.json(err("Only the author can update this"), { status: 403 });
  }
  const updated = await db.marketplace.update({ where: { id }, data: { status } });
  return NextResponse.json(ok(updated));
}
