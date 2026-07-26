"use client";
import Link from "next/link";
import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { STATIONS } from "@/lib/stations-data";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { LineDots, UserLink, TimeAgo, formatINR } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore, useUsersById } from "@/lib/store";
import { Route, Lightbulb, PackageSearch, HandHeart, MessageSquare, Users } from "lucide-react";

export default function StationDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const station = STATIONS.find((s) => s.code === code.toUpperCase());
  if (!station) notFound();

  // Select raw arrays (stable references) and compute filtered views with useMemo
  // to avoid returning fresh arrays from selectors on every render.
  const allPosts = useStore((s) => s.posts);
  const allCarpools = useStore((s) => s.carpools);
  const allIdeas = useStore((s) => s.ideas);
  const allLostFound = useStore((s) => s.lostFound);
  const allMarketplace = useStore((s) => s.marketplace);
  const allUsers = useStore((s) => s.users);
  const usersById = useUsersById();

  const posts = useMemo(() => allPosts.filter((p) => p.stationId === station.id).slice(0, 5), [allPosts, station.id]);
  const carpools = useMemo(() => allCarpools.filter((c) => c.originStationId === station.id && c.status === "open").slice(0, 5), [allCarpools, station.id]);
  const ideas = useMemo(() => allIdeas.filter((i) => i.stationId === station.id && i.status === "open").slice(0, 5), [allIdeas, station.id]);
  const lostFound = useMemo(() => allLostFound.filter((l) => l.stationId === station.id && l.status === "active").slice(0, 5), [allLostFound, station.id]);
  const marketplace = useMemo(() => allMarketplace.filter((m) => m.stationId === station.id && m.status === "available").slice(0, 5), [allMarketplace, station.id]);
  const members = useMemo(() => allUsers.filter((u) => u.homeStationId === station.id || u.workStationId === station.id).length, [allUsers, station.id]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
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

        <div className="mb-8 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline"><Link href={`/carpools?station=${station.code}`}><Route className="mr-1.5 h-4 w-4" aria-hidden /> Carpools from here</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href={`/ideas?station=${station.code}`}><Lightbulb className="mr-1.5 h-4 w-4" aria-hidden /> Idea Junction</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href={`/lost-found?station=${station.code}`}><PackageSearch className="mr-1.5 h-4 w-4" aria-hidden /> Lost & Found</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href={`/marketplace?station=${station.code}`}><HandHeart className="mr-1.5 h-4 w-4" aria-hidden /> Marketplace</Link></Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="h-4 w-4" aria-hidden /> Station feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {posts.length === 0 ? <p className="text-sm text-muted-foreground">No posts yet. Be the first.</p> : null}
              {posts.map((p) => (
                <div key={p.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <p className="line-clamp-2 text-sm">{p.body}</p>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <UserLink user={usersById[p.authorId] as any} />
                    <span><TimeAgo date={p.createdAt} /> · {p.replies.length} replies</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Route className="h-4 w-4" aria-hidden /> Open carpools</CardTitle>
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
                  <div className="mt-1.5"><UserLink user={usersById[c.authorId] as any} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="h-4 w-4" aria-hidden /> Ideas at this station</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ideas.length === 0 ? <p className="text-sm text-muted-foreground">No ideas posted here yet.</p> : null}
              {ideas.map((i) => (
                <div key={i.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">looking for: {i.lookingFor} · {i.stage}</p>
                  <div className="mt-1.5"><UserLink user={usersById[i.authorId] as any} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><PackageSearch className="h-4 w-4" aria-hidden /> Lost &amp; Found</CardTitle>
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
                  <div className="mt-1.5"><UserLink user={usersById[l.userId] as any} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><HandHeart className="h-4 w-4" aria-hidden /> Marketplace</CardTitle>
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
                  <div className="mt-1.5"><UserLink user={usersById[m.userId] as any} /></div>
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
