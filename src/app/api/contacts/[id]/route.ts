// PATCH /api/contacts/[id] — accept or decline an incoming contact request.
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
  if (!["accepted", "declined"].includes(status)) {
    return NextResponse.json(err("Invalid status"), { status: 400 });
  }
  const cr = await db.contactRequest.findUnique({ where: { id } });
  if (!cr) return NextResponse.json(err("Not found"), { status: 404 });
  if (cr.recipientId !== session.user.id) {
    return NextResponse.json(err("Only the recipient can respond"), { status: 403 });
  }
  const updated = await db.contactRequest.update({ where: { id }, data: { status } });
  return NextResponse.json(ok(updated));
}
