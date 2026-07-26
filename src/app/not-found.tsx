import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Train } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Train className="h-7 w-7" aria-hidden />
          </div>
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">This station doesn't exist on our map.</h1>
          <p className="mt-3 text-muted-foreground">
            The page you're looking for may have moved, or the station code is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><Link href="/">Back home</Link></Button>
            <Button asChild variant="outline"><Link href="/stations">Browse stations</Link></Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
