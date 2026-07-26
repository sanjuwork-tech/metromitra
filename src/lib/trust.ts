// Trust score computation + recompute helper.
// Intentionally simple and explainable. Recomputed on rating/report events.

import { db } from "@/lib/db";

export async function recomputeTrust(userId: string): Promise<number> {
  const [user, ratings, completed, reports] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.rating.findMany({ where: { ratedId: userId }, select: { score: true } }),
    db.contactRequest.count({
      where: {
        OR: [
          { initiatorId: userId, status: "accepted" },
          { recipientId: userId, status: "accepted" },
        ],
      },
    }),
    db.report.count({ where: { subjectId: userId, status: { in: ["open", "actioned"] } } }),
  ]);

  let score = 0;
  if (user) {
    const profileComplete =
      !!user.name && !!user.bio && !!user.city && (!!user.homeStationId || !!user.workStationId);
    if (profileComplete) score += 20;
    if (user.verifiedBadge) score += 10;
  }
  if (ratings.length > 0) {
    const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
    score += Math.round(avg * 4); // up to 20
  }
  score += Math.min(completed * 5, 35); // up to 35
  score -= Math.min(reports * 10, 30); // penalty

  score = Math.max(0, Math.min(100, score));
  await db.user.update({ where: { id: userId }, data: { trustScore: score } });
  return score;
}
