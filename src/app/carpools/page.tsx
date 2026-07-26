"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { AppShell, PageActionButton } from "@/components/site/app-shell";
import { apiFetch } from "@/lib/api-fetch";
import { StationSelect } from "@/components/shared/station-select";
import { TrustBadge, UserLink, EmptyState, formatDateTime } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Route, Users } from "lucide-react";
import type { CarpoolInput } from "@/lib/validators";

type Carpool = {
  id: string; type: string; destinationArea: string; departAt: string; seats: number;
  mode: string; costSplit: string; womenOnly: boolean; notes: string | null; status: string;
  author: { id: string; name: string; avatarUrl: string | null; verifiedBadge: boolean; trustScore: number };
  originStation: { id: string; code: string; name: string; city: string };
  _count?: { joins: number };
};

export default function CarpoolsPage() {
  const params = useSearchParams();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const stationFilter = params.get("station"); // station code, optional

  const { data, isLoading } = useQuery({
    queryKey: ["carpools", stationFilter],
    queryFn: () => {
      const url = new URL("/api/carpools", window.location.origin);
      url.searchParams.set("status", "open");
      if (stationFilter) url.searchParams.set("code", stationFilter);
      return apiFetch<Carpool[]>("/api/carpools?status=open");
    },
  });

  const joinMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/carpools/${id}/join`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => { toast.success("Join request sent"); qc.invalidateQueries({ queryKey: ["carpools"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell
      title="Carpools"
      description="Share a last-mile auto, cab or ride from a metro station."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Post a ride</Button>
          </DialogTrigger>
          <CarpoolCreateDialog onClose={() => setOpen(false)} />
        </Dialog>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No open rides right now"
          description="Post the first ride from your station. Offer a seat in your cab, or request one."
          action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Post a ride</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {data.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={c.type === "offer" ? "default" : "secondary"} className="uppercase text-xs">
                      {c.type === "offer" ? "Offering" : "Needs"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{c.mode}</Badge>
                    <Badge variant="outline" className="text-xs">{c.costSplit}</Badge>
                    {c.womenOnly && <Badge className="text-xs" style={{ background: "var(--color-line-magenta)", color: "white" }}>Women only</Badge>}
                    <span className="text-xs text-muted-foreground">{c.seats} {c.seats === 1 ? "seat" : "seats"}</span>
                  </div>
                  <p className="mt-1.5 font-medium">{c.destinationArea}</p>
                  <p className="text-xs text-muted-foreground">
                    from {c.originStation.name} ({c.originStation.code}) · {formatDateTime(c.departAt)}
                  </p>
                  {c.notes && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{c.notes}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <UserLink user={c.author} />
                    <TrustBadge trustScore={c.author.trustScore} verified={c.author.verifiedBadge} />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {c._count?.joins ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {c._count.joins} joined
                    </span>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => joinMut.mutate(c.id)} disabled={joinMut.isPending}>
                    Request to join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function CarpoolCreateDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<{
    type: "offer" | "request";
    originStationId: string;
    destinationArea: string;
    departAt: string;
    seats: number;
    mode: "auto" | "cab" | "personal";
    costSplit: "share" | "fixed" | "free";
    womenOnly: boolean;
    notes: string;
  }>({
    type: "offer",
    originStationId: "",
    destinationArea: "",
    departAt: "",
    seats: 1,
    mode: "auto",
    costSplit: "share",
    womenOnly: false,
    notes: "",
  });

  const mut = useMutation({
    mutationFn: (input: CarpoolInput) => apiFetch("/api/carpools", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Ride posted");
      qc.invalidateQueries({ queryKey: ["carpools"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.originStationId || !form.destinationArea || !form.departAt) {
      toast.error("Fill in station, destination and departure time");
      return;
    }
    mut.mutate({
      type: form.type,
      originStationId: form.originStationId,
      destinationArea: form.destinationArea,
      departAt: new Date(form.departAt).toISOString(),
      seats: form.seats,
      mode: form.mode,
      costSplit: form.costSplit,
      womenOnly: form.womenOnly,
      notes: form.notes || null,
    });
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Post a ride</DialogTitle>
        <DialogDescription>Offer a seat or request one for a last-mile ride.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>I want to</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="offer">Offer a ride</SelectItem>
                <SelectItem value="request">Request a ride</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="cab">Cab</SelectItem>
                <SelectItem value="personal">Personal vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>From station</Label>
          <StationSelect value={form.originStationId} onChange={(id) => setForm({ ...form, originStationId: id })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dest">Destination area</Label>
          <Input id="dest" value={form.destinationArea} onChange={(e) => setForm({ ...form, destinationArea: e.target.value })} placeholder="e.g. Indiranagar 100ft Road" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="depart">Departure</Label>
            <Input id="depart" type="datetime-local" value={form.departAt} onChange={(e) => setForm({ ...form, departAt: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seats">Seats</Label>
            <Input id="seats" type="number" min={1} max={8} value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Cost split</Label>
            <Select value={form.costSplit} onValueChange={(v) => setForm({ ...form, costSplit: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="share">Share equally</SelectItem>
                <SelectItem value="fixed">Fixed amount</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.womenOnly} onCheckedChange={(v) => setForm({ ...form, womenOnly: v })} />
              Women only
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
          <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} placeholder="Pickup point, landmarks, etc." />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Posting…" : "Post ride"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
