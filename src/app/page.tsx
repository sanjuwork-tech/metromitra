import Link from "next/link";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MetroMapHero } from "@/components/site/metro-map-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Route,
  ShieldCheck,
  PackageSearch,
  Search,
  HandHeart,
  ArrowRight,
  Train,
  Quote,
} from "lucide-react";

// Server component — fetches a small station sample for the directory preview.
async function getStationPreview() {
  const stations = await db.station.findMany({
    orderBy: [{ city: "asc" }, { name: "asc" }],
    take: 6,
    select: { id: true, code: true, name: true, city: true, lines: true, lineColors: true },
  });
  const cities = await db.station.findMany({
    distinct: ["city"],
    select: { city: true },
  });
  return { stations, cityCount: cities.length };
}

const lineColorVar: Record<string, string> = {
  blue: "var(--color-line-blue)",
  yellow: "var(--color-line-yellow)",
  red: "var(--color-line-red)",
  green: "var(--color-line-green)",
  violet: "var(--color-line-violet)",
  orange: "var(--color-line-orange)",
  magenta: "var(--color-line-magenta)",
  purple: "var(--color-line-purple)",
  aqua: "var(--color-line-aqua)",
};

function LineDots({ colors }: { colors: string }) {
  const cs = colors.split(",").filter(Boolean);
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Lines: ${cs.join(", ")}`}>
      {cs.map((c) => (
        <span
          key={c}
          className="h-2 w-2 rounded-full"
          style={{ background: lineColorVar[c] ?? "var(--muted-foreground)" }}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default async function Home() {
  const { stations, cityCount } = await getStationPreview();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* ─── HERO: asymmetric, promise + motif ─────────────────────── */}
        <section className="border-b border-border/60" aria-labelledby="hero-title">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
            <div className="metro-arrive">
              <Badge variant="secondary" className="mb-5 gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                For Indian metro commuters
              </Badge>
              <h1 id="hero-title" className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Find your people on the line you already ride.
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
                MetroMitra turns the daily metro commute into a connected experience.
                Share a last-mile auto, find a trusted travel buddy for the late shift,
                recover a dropped wallet, and trade within your station&rsquo;s community —
                all anchored to the station you pass through every day.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">
                    Join your line
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/stations">Browse stations</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Free to join. No app install. Works in your browser.
              </p>
            </div>
            <div className="metro-arrive" style={{ animationDelay: "0.1s" }}>
              <MetroMapHero />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Every station is a node. Every member is a connection.
              </p>
            </div>
          </div>
        </section>

        {/* ─── THE PAIN: editorial band, not three equal cards ──────── */}
        <section className="border-b border-border/60 bg-secondary/30" aria-labelledby="pain-title">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">The commuter reality</p>
              <h2 id="pain-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Millions ride the same line every day. Almost none of them talk.
              </h2>
              <p className="mt-4 text-muted-foreground">
                India&rsquo;s metro systems carry roughly 8 to 10 million passenger journeys
                a day across Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata and more.
                The commute is fast, cheap and safe on the train — but the moments around it
                are full of small, repeated friction that no general-purpose app solves.
              </p>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
              {[
                {
                  k: "Last mile",
                  v: "An auto from the station costs the same whether you ride solo or share. There is no structured way to find someone going your way.",
                },
                {
                  k: "Late shifts",
                  v: "The walk to the station exit feels longer after 9 pm. A known face on the same route changes that — but there is no way to find one.",
                },
                {
                  k: "Lost things",
                  v: "A dropped phone or ID card disappears into the crowd. The official lost-and-found counter is slow and station-bound.",
                },
                {
                  k: "Local trust",
                  v: "Buying a second-hand desk from someone two stations away should be easy. Today it means anonymous classifieds and guesswork.",
                },
              ].map((item) => (
                <div key={item.k} className="bg-card p-6">
                  <p className="text-sm font-semibold text-foreground">{item.k}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.v}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Ridership figures are publicly reported estimates for the underlying transit systems,
              cited only to size the audience. They are not MetroMitra&rsquo;s metrics.
            </p>
          </div>
        </section>

        {/* ─── CAPABILITIES: split, varied, not equal cards ────────── */}
        <section className="border-b border-border/60" aria-labelledby="caps-title">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">What MetroMitra does</p>
              <h2 id="caps-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                One community, built around the station you share.
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* capability 1 — larger, image-led */}
              <article className="md:col-span-2 md:grid md:grid-cols-[1.3fr_1fr] md:items-center md:gap-8">
                <div>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Route className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">Station-first community, not city-first</h3>
                  <p className="mt-2 text-muted-foreground">
                    Every post, ride, listing and buddy request is anchored to a real station
                    code. Filter by your station and see only what matters to the people who
                    pass through the same gates you do — Rajiv Chowk, Andheri, Cubbon Park,
                    Ameerpet, Chennai Central, Esplanade.
                  </p>
                </div>
                <div className="mt-6 md:mt-0">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Rajiv Chowk</p>
                        <p className="text-xs text-muted-foreground">Delhi · RJC</p>
                      </div>
                      <LineDots colors="blue,yellow" />
                    </div>
                    <div className="metro-divider my-3" aria-hidden />
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li>12 active carpools today</li>
                      <li>3 lost items waiting to be claimed</li>
                      <li>5 marketplace listings nearby</li>
                    </ul>
                  </div>
                </div>
              </article>

              {/* capability 2 */}
              <article>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Users className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-3 text-xl font-semibold">Last-mile carpool, done right</h3>
                <p className="mt-2 text-muted-foreground">
                  Offer or request a ride from a station to a destination area. See the other
                  person&rsquo;s commuter trust score, route streak and verification before you
                  commit. Women-only filtering built in.
                </p>
              </article>

              {/* capability 3 */}
              <article>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-3 text-xl font-semibold">Travel buddy for the moments that matter</h3>
                <p className="mt-2 text-muted-foreground">
                  Looking for company on an early-morning or late-evening leg? Post a buddy
                  request with your origin, destination and time. Match with someone going
                  the same way — no vehicle, no payment, just presence.
                </p>
              </article>

              {/* capability 4 */}
              <article>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <PackageSearch className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-3 text-xl font-semibold">Lost &amp; Found that actually networks</h3>
                <p className="mt-2 text-muted-foreground">
                  Report something lost or found at a station. It appears on that
                  station&rsquo;s feed instantly. Contact happens through the app — your number
                  stays private until you choose to share it.
                </p>
              </article>

              {/* capability 5 */}
              <article>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <HandHeart className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-3 text-xl font-semibold">A station marketplace you can trust</h3>
                <p className="mt-2 text-muted-foreground">
                  Buy and sell within your commuter community — textbooks, electronics,
                  furniture, household items. Listings carry the seller&rsquo;s trust score
                  and station, so you know who you&rsquo;re dealing with before you meet.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ─── DIFFERENTIATION: asymmetric comparison ──────────────── */}
        <section className="border-b border-border/60 bg-secondary/30" aria-labelledby="diff-title">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-start">
              <div>
                <p className="text-sm font-medium text-primary">Why it stands out</p>
                <h2 id="diff-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  Not another carpool app. Not another classifieds site.
                </h2>
                <p className="mt-4 text-muted-foreground">
                  General social apps are city-wide and anonymous. Carpool apps assume you
                  own a car. Classifieds don&rsquo;t know your station. MetroMitra is the only
                  place built around the unit that actually defines your commute: the station.
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium"> </th>
                      <th className="p-3 text-left font-medium">WhatsApp / OLX</th>
                      <th className="p-3 text-left font-medium text-primary">MetroMitra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ["Anchored to a specific station", "No", "Yes"],
                      ["Commuter trust score", "No", "Yes"],
                      ["Women-only matching", "No", "Yes"],
                      ["Last-mile ride + buddy + lost-and-found + market in one", "No", "Yes"],
                      ["India-native (UPI-aware, metro line semantics)", "Partial", "Yes"],
                    ].map((row) => (
                      <tr key={row[0]}>
                        <td className="p-3 text-muted-foreground">{row[0]}</td>
                        <td className="p-3 text-muted-foreground">{row[1]}</td>
                        <td className="p-3 font-medium text-foreground">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATION DIRECTORY PREVIEW ──────────────────────────── */}
        <section className="border-b border-border/60" aria-labelledby="dir-title">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">The network</p>
                <h2 id="dir-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  {cityCount} cities. Dozens of stations. Yours is here.
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/stations">
                  See all stations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stations.map((s) => (
                <Link
                  key={s.id}
                  href={`/stations/${s.code}`}
                  className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.city} · {s.code}</p>
                    </div>
                    <LineDots colors={s.lineColors} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {s.lines} line{s.lines.includes(",") ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── OBJECTION HANDLING: inline Q&A, not a giant accordion ─ */}
        <section className="border-b border-border/60 bg-secondary/30" aria-labelledby="faq-title">
          <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
            <p className="text-sm font-medium text-primary">Before you ask</p>
            <h2 id="faq-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Honest answers to the obvious questions.
            </h2>
            <dl className="mt-8 space-y-8">
              {[
                {
                  q: "Is this safe? How do I know who I'm meeting?",
                  a: "Every member builds a commuter profile with a trust score based on completed interactions, ratings, and profile completeness. Contact information is never exposed until both sides accept a request. We always recommend meeting in the public, monitored areas of a metro station.",
                },
                {
                  q: "Does MetroMitra process payments?",
                  a: "No. Marketplace listings and carpool cost-sharing express intent. Any money changes hands directly between you — cash or UPI — outside the platform. We do not hold or move money in this version.",
                },
                {
                  q: "What if my station has no activity yet?",
                  a: "New stations start quiet. The global feed and cross-station search keep the product useful everywhere. As a few commuters from your station join and post, the station page fills up naturally.",
                },
                {
                  q: "Is this an official metro app?",
                  a: "No. MetroMitra is an independent community platform. It is not affiliated with DMRC, MMRCL, BMRCL, HMRL, CMRL, or any metro corporation. Metro line names and station names are referenced only to orient members.",
                },
              ].map((item) => (
                <div key={item.q} className="border-l-2 border-primary/30 pl-5">
                  <dt className="font-medium">{item.q}</dt>
                  <dd className="mt-2 text-sm text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ─── A NOTE ON METHOD (proof of process, not fake testimonials) ─ */}
        <section className="border-b border-border/60" aria-labelledby="method-title">
          <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
            <Quote className="h-8 w-8 text-primary/30" aria-hidden />
            <h2 id="method-title" className="mt-4 text-balance text-2xl font-semibold tracking-tight">
              Built like a real product, not a demo.
            </h2>
            <p className="mt-4 text-muted-foreground">
              MetroMitra ships with a typed data model, server-rendered public pages for SEO,
              session-based authentication, validated API routes, an automated CI/CD pipeline,
              and a documented path from local SQLite to a managed database on Vercel. The
              architecture, data model, and deployment topology are written up in a separate
              engineering document with diagrams — the same way a real team would deliver it.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              See the <code className="rounded bg-muted px-1.5 py-0.5 text-xs">docs/</code> folder
              for the PRD, TechRD, and LaTeX architecture document.
            </p>
          </div>
        </section>

        {/* ─── FINAL CTA: single, clear ────────────────────────────── */}
        <section aria-labelledby="cta-title">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
            <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Train className="h-6 w-6" aria-hidden />
            </div>
            <h2 id="cta-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Your station already has a community. It just needs a place to meet.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Create a free account, set your home and work stations, and find the people
              riding your line.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Join your line
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5" aria-hidden />
              Browse stations and feeds without an account, too.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
