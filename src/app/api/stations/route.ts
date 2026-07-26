// GET /api/stations — list/filter stations. Public.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/validators";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city");
  const q = url.searchParams.get("q")?.trim();

  const where: any = {};
  if (city) where.city = city;
  if (q) where.name = { contains: q };

  const stations = await db.station.findMany({
    where,
    orderBy: [{ city: "asc" }, { name: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      city: true,
      lines: true,
      lineColors: true,
      exitCount: true,
    },
  });
  return NextResponse.json(ok(stations));
}
