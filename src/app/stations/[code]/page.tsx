// Station detail — public, server-rendered. Aggregates feed, rides, lost&found, market.
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { LineDots, StationLink, UserLink, TimeAgo, formatINR } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route, ShieldCheck, PackageSearch, HandHeart, MessageSquare, ArrowRight, Users } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const s = await db.station.findUnique({ where: { code: code.toUpperCase() } });
  if (!s) return { title: "Station not found" };
  return {
    title: `${s.name} (${s.code}) — ${s.city}`,
    description: `Community, carpools, lost & found and marketplace for ${s.name} metro station in ${s.city}.`,
  };
}

export default async function StationDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const station = await db.station.findUnique({ where: { code: code.toUpperCase() } });
  if (!station) notFound();

  const [posts, carpools, lostFound, marketplace, members] = await Promise.all([
    db.post.findMany({
      where: { stationId: station.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
        _count: { select: { replies: true } },
      },
    }),
    db.carpool.findMany({
      where: { originStationId: station.id, status: "open" },
      orderBy: { departAt: "asc" },
      take: 5,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
      },
    }),
    db.lostFound.findMany({
      where: { stationId: station.id, status: "active" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } } },
    }),
    db.marketplace.findMany({
      where: { stationId: station.id, status: "available" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } } },
    }),
    db.user.count({ where: { OR: [{ homeStationId: station.id }, { workStationId: station.id }] } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">{station.city}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{station.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span>Code: {station.code}</span>
              <span aria-hidden>·</span>
              <span>Lines: {station.lines}</span>
              <span aria-hidden>·</span>
              <LineDots colors={station.lineColors} />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <Users className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium">{members}</p>
              <p className="text-xs text-muted-foreground">members</p>
            </div>
          </div>
        </div>

        {/* Quick links to post within this station context */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/carpools?station=${station.code}`}><Route className="mr-1.5 h-4 w-4" aria-hidden /> Carpools from here</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/buddies?station=${station.code}`}><ShieldCheck className="mr-1.5 h-4 w-4" aria-hidden /> Travel buddies</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/lost-found?station=${station.code}`}><PackageSearch className="mr-1.5 h-4 w-4" aria-hidden /> Lost & Found</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/marketplace?station=${station.code}`}><HandHeart className="mr-1.5 h-4 w-4" aria-hidden /> Marketplace</Link>
          </Button>
        </div>

        {/* Grid of activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" aria-hidden /> Station feed</span>
                <Link href={`/feed?station=${station.id}`} className="text-xs font-normal text-primary hover:underline">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {posts.length === 0 ? <p className="text-sm text-muted-foreground">No posts yet. Be the first.</p> : null}
              {posts.map((p) => (
                <div key={p.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <p className="line-clamp-2 text-sm">{p.body}</p>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <UserLink user={p.author} />
                    <span><TimeAgo date={p.createdAt} /> · {p._count.replies} replies</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2"><Route className="h-4 w-4" aria-hidden /> Open carpools</span>
                <Link href={`/carpools?station=${station.code}`} className="text-xs font-normal text-primary hover:underline">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {carpools.length === 0 ? <p className="text-sm text-muted-foreground">No open rides from this station.</p> : null}
              {carpools.map((c) => (
                <div key={c.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase text-muted-foreground">{c.type}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.departAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{c.destinationArea}</p>
                  <div className="mt-1.5"><UserLink user={c.author} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2"><PackageSearch className="h-4 w-4" aria-hidden /> Lost &amp; Found</span>
                <Link href={`/lost-found?station=${station.code}`} className="text-xs font-normal text-primary hover:underline">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lostFound.length === 0 ? <p className="text-sm text-muted-foreground">Nothing reported here.</p> : null}
              {lostFound.map((l) => (
                <div key={l.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase" style={{ color: l.type === "lost" ? "var(--destructive)" : "var(--color-line-green)" }}>{l.type}</span>
                    <span className="text-xs text-muted-foreground">{l.category}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{l.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{l.description}</p>
                  <div className="mt-1.5"><UserLink user={l.user} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2"><HandHeart className="h-4 w-4" aria-hidden /> Marketplace</span>
                <Link href={`/marketplace?station=${station.code}`} className="text-xs font-normal text-primary hover:underline">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketplace.length === 0 ? <p className="text-sm text-muted-foreground">No listings nearby.</p> : null}
              {marketplace.map((m) => (
                <div key={m.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-sm font-semibold text-primary">{formatINR(m.price)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.category} · {m.condition}</p>
                  <div className="mt-1.5"><UserLink user={m.user} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
