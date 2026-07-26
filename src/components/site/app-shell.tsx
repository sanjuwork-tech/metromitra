"use client";
// Authenticated application shell: header + page content + footer.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-client";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Route,
  Users,
  Lightbulb,
  PackageSearch,
  HandHeart,
  MessageSquare,
  User as UserIcon,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stations", label: "Stations", icon: Route },
  { href: "/carpools", label: "Carpools", icon: Users },
  { href: "/ideas", label: "Idea Junction", icon: Lightbulb },
  { href: "/lost-found", label: "Lost & Found", icon: PackageSearch },
  { href: "/marketplace", label: "Marketplace", icon: HandHeart },
  { href: "/feed", label: "Community", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function AppShell({ children, title, description, action }: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 space-y-1" aria-label="Application">
            {items.map((it) => {
              const Icon = it.icon;
              const active = pathname === it.href || (it.href !== "/dashboard" && pathname.startsWith(it.href));
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {(title || action) && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                {!user?.homeStationId && (
                  <Badge variant="secondary" className="mt-2">
                    Tip: set your home & work stations in your profile
                  </Badge>
                )}
              </div>
              {action}
            </div>
          )}
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

export function MobileNavHint() {
  // On mobile the top SiteHeader already provides navigation; this is a
  // small helper for authenticated pages to surface a "menu" affordance.
  return (
    <p className="mb-4 text-xs text-muted-foreground md:hidden">
      Use the menu in the header to navigate.
    </p>
  );
}

export function PageActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild size="sm">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
