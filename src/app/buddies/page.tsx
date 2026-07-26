"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/site/app-shell";
import { apiFetch } from "@/lib/api-fetch";
import { StationSelect } from "@/components/shared/station-select";
import { TrustBadge, UserLink, EmptyState, formatDateTime } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ArrowRight, ShieldCheck } from "lucide-react";

type Buddy = {
  id: string; travelAt: string; womenOnly: boolean; notes: string | null; status: string;
  user: { id: string; name: string; avatarUrl: string | null; verifiedBadge: boolean; trustScore: number };
  originStation: { id: string; code: string; name: string; city: string };
  destStation: { id: string; code: string; name: string; city: string } | null;
};

export default function BuddiesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["buddies"],
    queryFn: () => apiFetch<Buddy[]>("/api/buddies?status=open"),
  });

  return (
    <AppShell
      title="Travel buddy"
      description="Find a trusted companion for a metro leg — for safety, company, or navigation."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Post a request</Button>
          </DialogTrigger>
          <BuddyCreateDialog onClose={() => setOpen(false)} />
        </Dialog>
      }
    >
      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No open buddy requests"
          description="Post one for your next commute — early mornings and late evenings especially."
          action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Post a request</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {data.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {b.womenOnly && <Badge className="text-xs" style={{ background: "var(--color-line-magenta)", color: "white" }}>Women only</Badge>}
                    <span className="text-xs text-muted-foreground">{formatDateTime(b.travelAt)}</span>
                  </div>
                  <p className="mt-1.5 flex items-center gap-2 font-medium">
                    {b.originStation.name}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {b.destStation?.name ?? "Anywhere on the line"}
                  </p>
                  {b.notes && <p className="mt-1 text-xs text-muted-foreground">{b.notes}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <UserLink user={b.user} />
                    <TrustBadge trustScore={b.user.trustScore} verified={b.user.verifiedBadge} />
                  </div>
                </div>
                <div className="shrink-0">
                  <ContactBuddyButton buddy={b} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ContactBuddyButton({ buddy }: { buddy: Buddy }) {
  const mut = useMutation({
    mutationFn: () => apiFetch(`/api/contacts`, {
      method: "POST",
      body: JSON.stringify({ recipientId: buddy.user.id, contextType: "buddy", contextId: buddy.id, message: "I'm going the same way — shall we coordinate?" }),
    }),
    onSuccess: () => toast.success("Contact request sent"),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Button size="sm" variant="outline" onClick={() => mut.mutate()} disabled={mut.isPending}>
      <ShieldCheck className="mr-1.5 h-4 w-4" /> I'm going too
    </Button>
  );
}

function BuddyCreateDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [originStationId, setOrigin] = useState("");
  const [destStationId, setDest] = useState<string>("");
  const [travelAt, setTravelAt] = useState("");
  const [womenOnly, setWomenOnly] = useState(false);
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: () => apiFetch("/api/buddies", {
      method: "POST",
      body: JSON.stringify({
        originStationId,
        destStationId: destStationId || null,
        travelAt: new Date(travelAt).toISOString(),
        womenOnly,
        notes: notes || null,
      }),
    }),
    onSuccess: () => {
      toast.success("Buddy request posted");
      qc.invalidateQueries({ queryKey: ["buddies"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!originStationId || !travelAt) { toast.error("Pick an origin station and time"); return; }
    mut.mutate();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Post a travel buddy request</DialogTitle>
        <DialogDescription>Find someone going your way at your time.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>From station</Label>
          <StationSelect value={originStationId} onChange={setOrigin} autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label>To station <span className="text-muted-foreground">(optional)</span></Label>
          <StationSelect value={destStationId} onChange={setDest} placeholder="Any station on the line" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="travel">Travelling at</Label>
          <Input id="travel" type="datetime-local" value={travelAt} onChange={(e) => setTravelAt(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={womenOnly} onCheckedChange={setWomenOnly} />
          Women only
        </label>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Which coach, which exit, anything that helps." />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Posting…" : "Post request"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
