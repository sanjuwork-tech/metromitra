import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Train, Github, Code2 } from "lucide-react";
import { STATIONS } from "@/lib/stations-data";

export const metadata = {
  title: "About MetroMitra",
  description: "What MetroMitra is, who it's for, and how it was built.",
};

export default function AboutPage() {
  const stationCount = STATIONS.length;
  const cityCount = Array.from(new Set(STATIONS.map((s) => s.city))).length;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Train className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">About MetroMitra</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A hyperlocal community platform built around Indian metro stations.
          {stationCount} stations seeded across {cityCount} cities — and growing.
        </p>

        <div className="prose-sm mt-8 space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">The idea</h2>
            <p className="mt-2 text-muted-foreground">
              Millions of Indians ride the metro every day. The train ride itself is fast and
              efficient — but the moments around it are full of small, repeated friction:
              an expensive last-mile auto, an unfamiliar exit, a dropped phone, a lonely walk
              after a late shift. MetroMitra treats the metro station as the natural unit of
              community and gives the people who share a station a place to find each other.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">What it does</h2>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              <li>Station-scoped community feed — ask, inform, alert, organise.</li>
              <li>Last-mile carpool — offer or request a ride from a station, with trust signals.</li>
              <li>Idea Junction — post entrepreneurial ideas and find co-founders among your station community.</li>
              <li>Lost &amp; Found — report items to the station community instantly.</li>
              <li>Station marketplace — buy and sell within a trusted commuter pool.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">How it was built</h2>
            <p className="mt-2 text-muted-foreground">
              MetroMitra is a Next.js 16 application with TypeScript, Tailwind CSS 4, shadcn/ui,
              and Zustand for local browser storage. It runs with no backend, no database and no
              API — all data lives in your browser — and is deployed to Vercel through an
              automated GitHub Actions CI/CD pipeline.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="https://github.com/sanjuwork-tech/metromitra" target="_blank" rel="noreferrer"><Github className="mr-1.5 h-4 w-4" /> Source on GitHub</Link>
              </Button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Honest limitations</h2>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              <li>
                <Code2 className="mr-1 inline h-4 w-4 text-muted-foreground" aria-hidden />
                This demo runs entirely in your browser (localStorage). There is no backend or
                database, so data does not sync across devices and is cleared if you reset browser
                data. The architecture document describes the migration path to a real backend if
                the product were to scale.
              </li>
              <li>No real payments are processed. Marketplace and carpool cost-splitting are intent-only.</li>
              <li>MetroMitra is an independent project and is not affiliated with any metro corporation.</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 flex gap-3">
          <Button asChild><Link href="/register">Join your line</Link></Button>
          <Button asChild variant="outline"><Link href="/stations">Browse stations</Link></Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
