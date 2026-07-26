// POST /api/marketplace/[id]/contact — initiate an in-app contact request.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactRequestSchema, ok, err, zodErrors } from "@/lib/validators";
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
  const item = await db.marketplace.findUnique({ where: { id } });
  if (!item) return NextResponse.json(err("Listing not found"), { status: 404 });
  if (item.userId === session.user.id) {
    return NextResponse.json(err("This is your own listing"), { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = contactRequestSchema.safeParse({
    ...body,
    recipientId: item.userId,
    contextType: "marketplace",
    contextId: id,
  });
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const cr = await db.contactRequest.create({
    data: {
      initiatorId: session.user.id,
      recipientId: item.userId,
      contextType: "marketplace",
      contextId: id,
      message: parsed.data.message ?? null,
    },
  });
  return NextResponse.json(ok(cr), { status: 201 });
}
