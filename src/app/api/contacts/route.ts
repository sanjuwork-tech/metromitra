// GET /api/contacts — list contact requests for the current user (incoming + outgoing).
// PATCH /api/contacts/[id] — accept or decline an incoming request.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in"), { status: 401 });
  }
  const [incoming, outgoing] = await Promise.all([
    db.contactRequest.findMany({
      where: { recipientId: session.user.id, status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        initiator: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      },
    }),
    db.contactRequest.findMany({
      where: { initiatorId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        recipient: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      },
    }),
  ]);
  return NextResponse.json(ok({ incoming, outgoing }));
}
