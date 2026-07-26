"use client";
import { useState } from "react";
import { AppShell } from "@/components/site/app-shell";
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
import { Plus, Users } from "lucide-react";
import { useStore, useUsersById } from "@/lib/store";
import { useAuth } from "@/lib/auth-client";
import { STATIONS } from "@/lib/stations-data";

export default function CarpoolsPage() {
  const carpools = useStore((s) => s.carpools);
  const usersById = useUsersById();
  const joinCarpool = useStore((s) => s.joinCarpool);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const openRides = carpools.filter((c) => c.status === "open");

  function handleJoin(id: string) {
    if (!user) { toast.error("Sign in to join a ride"); return; }
    const res = joinCarpool(id);
    if (res.ok) toast.success("Join request sent"); else toast.error(res.error || "Could not join");
  }

  return (
    <AppShell
      title="Carpools"
      description="Share a last-mile auto, cab or ride from a metro station."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Post a ride</Button></DialogTrigger>
          <CarpoolCreateDialog onClose={() => setOpen(false)} />
        </Dialog>
      }
    >
      {openRides.length === 0 ? (
        <EmptyState
          title="No open rides right now"
          description="Post the first ride from your station. Offer a seat in your cab, or request one."
          action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Post a ride</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {openRides.map((c) => {
            const st = STATIONS.find((s) => s.id === c.originStationId);
            const author = usersById[c.authorId];
            const accepted = c.joins.filter((j) => j.status === "accepted").length;
            return (
              <Card key={c.id} className="overflow-hidden">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={c.type === "offer" ? "default" : "secondary"} className="uppercase text-xs">{c.type === "offer" ? "Offering" : "Needs"}</Badge>
                      <Badge variant="outline" className="text-xs">{c.mode}</Badge>
                      <Badge variant="outline" className="text-xs">{c.costSplit}</Badge>
                      {c.womenOnly && <Badge className="text-xs" style={{ background: "var(--color-line-magenta)", color: "white" }}>Women only</Badge>}
                      <span className="text-xs text-muted-foreground">{c.seats} {c.seats === 1 ? "seat" : "seats"}</span>
                    </div>
                    <p className="mt-1.5 font-medium">{c.destinationArea}</p>
                    <p className="text-xs text-muted-foreground">from {st?.name} ({st?.code}) · {formatDateTime(c.departAt)}</p>
                    {c.notes && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{c.notes}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <UserLink user={author as any} />
                      {author && <TrustBadge trustScore={author.trustScore} verified={author.verifiedBadge} />}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {accepted ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> {accepted} joined</span> : null}
                    <Button size="sm" variant="outline" onClick={() => handleJoin(c.id)}>Request to join</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function CarpoolCreateDialog({ onClose }: { onClose: () => void }) {
  const createCarpool = useStore((s) => s.createCarpool);
  const [type, setType] = useState<"offer" | "request">("offer");
  const [originStationId, setOrigin] = useState("");
  const [destinationArea, setDest] = useState("");
  const [departAt, setDepartAt] = useState("");
  const [seats, setSeats] = useState(1);
  const [mode, setMode] = useState<"auto" | "cab" | "personal">("auto");
  const [costSplit, setCostSplit] = useState<"share" | "fixed" | "free">("share");
  const [womenOnly, setWomenOnly] = useState(false);
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!originStationId || !destinationArea || !departAt) { toast.error("Fill in station, destination and departure time"); return; }
    createCarpool({ type, originStationId, destinationArea, departAt: new Date(departAt).toISOString(), seats, mode, costSplit, womenOnly, notes: notes || undefined });
    toast.success("Ride posted");
    onClose();
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
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="offer">Offer a ride</SelectItem><SelectItem value="request">Request a ride</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="auto">Auto</SelectItem><SelectItem value="cab">Cab</SelectItem><SelectItem value="personal">Personal vehicle</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>From station</Label><StationSelect value={originStationId} onChange={setOrigin} /></div>
        <div className="space-y-1.5"><Label htmlFor="dest">Destination area</Label><Input id="dest" value={destinationArea} onChange={(e) => setDest(e.target.value)} placeholder="e.g. Indiranagar 100ft Road" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label htmlFor="depart">Departure</Label><Input id="depart" type="datetime-local" value={departAt} onChange={(e) => setDepartAt(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="seats">Seats</Label><Input id="seats" type="number" min={1} max={8} value={seats} onChange={(e) => setSeats(Number(e.target.value))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Cost split</Label><Select value={costSplit} onValueChange={(v) => setCostSplit(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="share">Share equally</SelectItem><SelectItem value="fixed">Fixed amount</SelectItem><SelectItem value="free">Free</SelectItem></SelectContent></Select></div>
          <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm"><Switch checked={womenOnly} onCheckedChange={setWomenOnly} /> Women only</label></div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Pickup point, landmarks, etc." /></div>
        <DialogFooter><Button type="submit">Post ride</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
