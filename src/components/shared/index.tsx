// Shared presentational helpers for feature pages.
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
  pink: "var(--color-line-pink)",
  grey: "var(--color-line-grey)",
};

export function LineDots({ colors, className }: { colors: string; className?: string }) {
  const cs = colors.split(",").filter(Boolean);
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Lines: ${cs.join(", ")}`}>
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

export function StationLink({ station }: {
  station: { code: string; name: string; city: string } | null;
}) {
  if (!station) return <span className="text-muted-foreground">Anywhere</span>;
  return (
    <Link href={`/stations/${station.code}`} className="inline-flex items-center gap-1.5 text-sm hover:underline">
      <span className="font-medium">{station.name}</span>
      <span className="text-xs text-muted-foreground">{station.code} · {station.city}</span>
    </Link>
  );
}

export function TrustBadge({ trustScore, verified, size = "sm" }: {
  trustScore: number;
  verified?: boolean;
  size?: "sm" | "default";
}) {
  const tone =
    trustScore >= 60 ? "text-green-700 bg-green-50 border-green-200"
    : trustScore >= 30 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-muted-foreground bg-muted/50 border-border";
  return (
    <span className="inline-flex items-center gap-2">
      {verified && (
        <Badge variant="outline" className={cn("gap-1 border-green-200 bg-green-50 text-green-700", size === "sm" && "text-xs")}>
          <ShieldCheck className="h-3 w-3" aria-hidden /> Verified
        </Badge>
      )}
      <Badge variant="outline" className={cn("gap-1", tone, size === "sm" && "text-xs")}>
        <Star className="h-3 w-3" aria-hidden /> {trustScore}
      </Badge>
    </span>
  );
}

export function UserLink({ user }: {
  user: { id: string; name: string; avatarUrl?: string | null; verifiedBadge?: boolean; trustScore?: number } | null;
}) {
  if (!user) return <span className="text-muted-foreground">Unknown</span>;
  return (
    <Link href={`/profile?id=${user.id}`} className="inline-flex items-center gap-2 text-sm hover:underline">
      <Avatar name={user.name} url={user.avatarUrl} />
      <span className="font-medium">{user.name}</span>
      {user.verifiedBadge && <ShieldCheck className="h-3.5 w-3.5 text-green-600" aria-hidden />}
    </Link>
  );
}

export function Avatar({ name, url, size = 32 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  if (url) {
    return <img src={url} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="grid place-items-center rounded-full bg-primary/10 text-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}

export function EmptyState({ title, description, action }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TimeAgo({ date }: { date: string | Date }) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <span>just now</span>;
  if (mins < 60) return <span>{mins}m ago</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span>{hrs}h ago</span>;
  const days = Math.floor(hrs / 24);
  if (days < 7) return <span>{days}d ago</span>;
  return <span>{d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>;
}

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function formatDateTime(s: string | Date): string {
  const d = typeof s === "string" ? new Date(s) : s;
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
