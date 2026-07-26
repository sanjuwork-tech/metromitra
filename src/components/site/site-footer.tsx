import Link from "next/link";
import { Train } from "lucide-react";

const footerNav = [
  {
    title: "Product",
    links: [
      { href: "/stations", label: "Stations" },
      { href: "/carpools", label: "Carpools" },
      { href: "/buddies", label: "Travel buddy" },
      { href: "/lost-found", label: "Lost & Found" },
      { href: "/marketplace", label: "Marketplace" },
    ],
  },
  {
    title: "MetroMitra",
    links: [
      { href: "/about", label: "About" },
      { href: "/register", label: "Create an account" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
                <Train className="h-4 w-4" aria-hidden />
              </span>
              <span>Metro<span className="text-primary">Mitra</span></span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              A hyperlocal community for Indian metro commuters. Find your people
              on the line you already ride.
            </p>
          </div>
          {footerNav.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-medium">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="metro-divider my-8" aria-hidden />
        <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} MetroMitra. Built for Indian metro commuters.</p>
          <p className="max-w-md sm:text-right">
            Demo project. No real payments. Always meet in public station areas and use your judgement.
          </p>
        </div>
      </div>
    </footer>
  );
}
