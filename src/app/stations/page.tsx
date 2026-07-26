// Station directory — public, SEO-friendly. Stations are static reference data (no backend).
import Link from "next/link";
import { STATIONS, CITIES } from "@/lib/stations-data";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { LineDots } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Stations — browse Indian metro stations",
  description: "Browse metro stations across Delhi, Mumbai, Bengaluru, Hyderabad, Chennai and Kolkata. Each station has its own community feed, carpools, ideas, lost & found and marketplace.",
};

export default function StationsPage({ searchParams }: { searchParams: { city?: string; q?: string } }) {
  const { city, q } = searchParams;
  let stations = STATIONS;
  if (city) stations = stations.filter((s) => s.city === city);
  if (q) stations = stations.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  const byCity = stations.reduce<Record<string, typeof STATIONS>>((acc, s) => {
    (acc[s.city] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Metro stations</h1>
          <p className="mt-1 text-muted-foreground">
            {stations.length} stations across {Object.keys(byCity).length} cities. Pick yours to see its community.
          </p>
        </div>

        <form className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="q" defaultValue={q ?? ""} placeholder="Search station name…" className="pl-9" aria-label="Search stations" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant={!city ? "default" : "outline"} size="sm" className="h-9">
              <Link href={q ? `/stations?${new URLSearchParams({ q })}` : "/stations"}>All</Link>
            </Button>
            {CITIES.map((c) => (
              <Button key={c} asChild variant={city === c ? "default" : "outline"} size="sm" className="h-9">
                <Link href={`/stations?${new URLSearchParams({ ...(q ? { q } : {}), city: c })}`}>{c}</Link>
              </Button>
            ))}
          </div>
          <Button type="submit" size="sm" className="h-9">Search</Button>
        </form>

        {stations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
            No stations match your search.
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(byCity).map(([cityName, list]) => (
              <section key={cityName}>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">{cityName}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((s) => (
                    <Link key={s.id} href={`/stations/${s.code}`} className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.code}{s.exitCount ? ` · ${s.exitCount} exits` : ""}</p>
                        </div>
                        <LineDots colors={s.lineColors} />
                      </div>
                      <p className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{s.lines}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
