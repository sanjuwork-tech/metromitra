// POST /api/reports — flag a piece of content for manual moderation.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reportSchema, ok, err, zodErrors } from "@/lib/validators";
import { requireSession } from "@/lib/session";

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(err("Sign in"), { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json(err("Invalid JSON"), { status: 400 });
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(err(zodErrors(parsed as any)), { status: 400 });

  const { subjectId, targetType, targetId, reason } = parsed.data;
  const subject = await db.user.findUnique({ where: { id: subjectId } });
  if (!subject) return NextResponse.json(err("Subject not found"), { status: 404 });

  const report = await db.report.create({
    data: {
      reporterId: session.user.id,
      subjectId,
      targetType,
      targetId,
      reason,
    },
  });
  return NextResponse.json(ok(report), { status: 201 });
}
