"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/site/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineDots, StationLink, TimeAgo, UserLink } from "@/components/shared";
import { useAuth } from "@/lib/auth-client";
import { useStore, useUsersById, getStationById } from "@/lib/store";
import { Route, Lightbulb, PackageSearch, HandHeart, MessageSquare, ArrowRight, MapPin } from "lucide-react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<AppShell title="Loading…"><div className="h-64 animate-pulse rounded-lg bg-muted" /></AppShell>}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const welcome = params.get("welcome") === "1";
  const { user, status } = useAuth();
  const posts = useStore((s) => s.posts);
  const carpools = useStore((s) => s.carpools);
  const ideas = useStore((s) => s.ideas);
  const usersById = useUsersById();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login?callbackUrl=/dashboard");
  }, [status, router]);

  if (status === "loading" || !user) {
    return <AppShell title="Loading…"><div className="h-64 animate-pulse rounded-lg bg-muted" /></AppShell>;
  }

  const homeStation = getStationById(user.homeStationId);
  const workStation = getStationById(user.workStationId);
  const firstName = user.name?.split(" ")[0] ?? "there";

  const recentCarpools = carpools.filter((c) => c.status === "open").slice(0, 3);
  const recentIdeas = ideas.slice(0, 3);
  const recentFeed = posts.slice(0, 3);

  return (
    <AppShell
      title={welcome ? `Welcome, ${firstName}` : `Hello, ${firstName}`}
      description="Your daily metro community, at a glance."
      action={<Button asChild size="sm"><Link href="/profile">Complete your profile</Link></Button>}
    >
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
              {homeStation ? (
                <div>
                  <StationLink station={homeStation} />
                  <div className="mt-2"><LineDots colors={homeStation.lineColors} /></div>
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
              {workStation ? (
                <div>
                  <StationLink station={workStation} />
                  <div className="mt-2"><LineDots colors={workStation.lineColors} /></div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not set. <Link href="/profile" className="text-primary hover:underline">Add it</Link>.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {[
            { href: "/carpools", label: "Find a ride", icon: Route },
            { href: "/ideas", label: "Idea Junction", icon: Lightbulb },
            { href: "/lost-found", label: "Lost & Found", icon: PackageSearch },
            { href: "/marketplace", label: "Marketplace", icon: HandHeart },
            { href: "/feed", label: "Community", icon: MessageSquare },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href} className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
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
            {recentCarpools.map((c) => {
              const st = getStationById(c.originStationId);
              const author = usersById[c.authorId];
              return (
                <div key={c.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase text-muted-foreground">{c.type}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.departAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{c.destinationArea}</p>
                  <p className="text-xs text-muted-foreground">from {st?.name}</p>
                  <div className="mt-1.5"><UserLink user={author as any} /></div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4" aria-hidden /> Ideas at Idea Junction</span>
              <Link href="/ideas" className="text-xs font-normal text-primary hover:underline">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentIdeas.length === 0 && <p className="text-sm text-muted-foreground">No ideas posted yet.</p>}
            {recentIdeas.map((i) => {
              const author = usersById[i.authorId];
              return (
                <div key={i.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">looking for: {i.lookingFor} · {i.stage}</p>
                  <div className="mt-1.5"><UserLink user={author as any} /></div>
                </div>
              );
            })}
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
            {recentFeed.map((p) => {
              const author = usersById[p.authorId];
              return (
                <div key={p.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <p className="line-clamp-2 text-sm">{p.body}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <UserLink user={author as any} />
                    <TimeAgo date={p.createdAt} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
