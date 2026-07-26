// Dashboard — authenticated landing. Server-rendered with session check.
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, type AppSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/site/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineDots, StationLink, TimeAgo, UserLink } from "@/components/shared";
import Link from "next/link";
import { Route, Users, ShieldCheck, PackageSearch, HandHeart, MessageSquare, ArrowRight, MapPin } from "lucide-react";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const session = (await getServerSession(authOptions)) as AppSession | null;
  if (!session || !session.user?.id) redirect("/login?callbackUrl=/dashboard");
  const { welcome } = await searchParams;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, city: true, trustScore: true, verifiedBadge: true,
      homeStation: { select: { id: true, code: true, name: true, city: true, lineColors: true } },
      workStation: { select: { id: true, code: true, name: true, city: true, lineColors: true } },
    },
  });

  // Recent activity across the platform (for the welcome state).
  const [recentCarpools, recentBuddies, recentFeed] = await Promise.all([
    db.carpool.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
        originStation: { select: { id: true, code: true, name: true, city: true } },
      },
    }),
    db.buddyRequest.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
        originStation: { select: { id: true, code: true, name: true, city: true } },
        destStation: { select: { id: true, code: true, name: true, city: true } },
      },
    }),
    db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, verifiedBadge: true, trustScore: true } },
        station: { select: { id: true, code: true, name: true, city: true } },
      },
    }),
  ]);

  return (
    <AppShell
      title={welcome ? `Welcome, ${user?.name?.split(" ")[0]}` : `Hello, ${user?.name?.split(" ")[0]}`}
      description="Your daily metro community, at a glance."
      action={
        <Button asChild size="sm">
          <Link href="/profile">Complete your profile</Link>
        </Button>
      }
    >
      {/* My stations */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">My stations</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" aria-hidden /> Home station
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.homeStation ? (
                <div>
                  <StationLink station={user.homeStation} />
                  <div className="mt-2"><LineDots colors={user.homeStation.lineColors} /></div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not set. <Link href="/profile" className="text-primary hover:underline">Add it</Link>.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" aria-hidden /> Work / college station
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.workStation ? (
                <div>
                  <StationLink station={user.workStation} />
                  <div className="mt-2"><LineDots colors={user.workStation.lineColors} /></div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not set. <Link href="/profile" className="text-primary hover:underline">Add it</Link>.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { href: "/carpools", label: "Find a ride", icon: Route },
            { href: "/buddies", label: "Travel buddy", icon: ShieldCheck },
            { href: "/lost-found", label: "Lost & Found", icon: PackageSearch },
            { href: "/marketplace", label: "Marketplace", icon: HandHeart },
            { href: "/feed", label: "Community", icon: MessageSquare },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-medium">{a.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><Route className="h-4 w-4" aria-hidden /> Open carpools</span>
              <Link href="/carpools" className="text-xs font-normal text-primary hover:underline">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCarpools.length === 0 && <p className="text-sm text-muted-foreground">No open rides yet.</p>}
            {recentCarpools.map((c) => (
              <div key={c.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase text-muted-foreground">{c.type}</span>
                  <span className="text-xs text-muted-foreground">{new Date(c.departAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="mt-1 text-sm font-medium">{c.destinationArea}</p>
                <p className="text-xs text-muted-foreground">from {c.originStation?.name}</p>
                <div className="mt-1.5"><UserLink user={c.author} /></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" aria-hidden /> Buddy requests</span>
              <Link href="/buddies" className="text-xs font-normal text-primary hover:underline">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBuddies.length === 0 && <p className="text-sm text-muted-foreground">No buddy requests yet.</p>}
            {recentBuddies.map((b) => (
              <div key={b.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium">{b.originStation?.name}{b.destStation ? ` → ${b.destStation.name}` : ""}</p>
                <p className="text-xs text-muted-foreground">{new Date(b.travelAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                <div className="mt-1.5"><UserLink user={b.user} /></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" aria-hidden /> Community feed</span>
              <Link href="/feed" className="text-xs font-normal text-primary hover:underline">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFeed.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
            {recentFeed.map((p) => (
              <div key={p.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                <p className="line-clamp-2 text-sm">{p.body}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <UserLink user={p.author} />
                  <TimeAgo date={p.createdAt} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
