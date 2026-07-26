"use client";
import { useState } from "react";
import { AppShell } from "@/components/site/app-shell";
import { StationSelect } from "@/components/shared/station-select";
import { TrustBadge, UserLink, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, MessageSquare } from "lucide-react";
import { useStore, useUsersById } from "@/lib/store";
import { useAuth } from "@/lib/auth-client";
import { STATIONS } from "@/lib/stations-data";

const CATEGORIES = ["wallet", "phone", "keys", "bag", "id", "electronics", "other"] as const;

export default function LostFoundPage() {
  const items = useStore((s) => s.lostFound);
  const usersById = useUsersById();
  const contact = useStore((s) => s.contactLostFound);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");

  const list = items.filter((l) => l.status === "active" && (!typeFilter || l.type === typeFilter));

  function handleContact(id: string, userId: string) {
    if (!user) { toast.error("Sign in to contact"); return; }
    if (userId === user.id) { toast.error("This is your own listing"); return; }
    const res = contact(id, "I think this is mine / I can help.");
    if (res.ok) toast.success("Contact request sent"); else toast.error(res.error || "Could not send");
  }

  return (
    <AppShell
      title="Lost & Found"
      description="Report something lost or found at a station. Contact happens through the app."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Post an item</Button></DialogTrigger>
          <LostFoundCreateDialog onClose={() => setOpen(false)} />
        </Dialog>
      }
    >
      <div className="mb-4 flex gap-2">
        <Button size="sm" variant={!typeFilter ? "default" : "outline"} onClick={() => setTypeFilter("")}>All</Button>
        <Button size="sm" variant={typeFilter === "lost" ? "default" : "outline"} onClick={() => setTypeFilter("lost")}>Lost</Button>
        <Button size="sm" variant={typeFilter === "found" ? "default" : "outline"} onClick={() => setTypeFilter("found")}>Found</Button>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No active reports" description="Lost something? Found something? Post it here so your station community can help." action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Post an item</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((it) => {
            const st = STATIONS.find((s) => s.id === it.stationId);
            const author = usersById[it.userId];
            return (
              <Card key={it.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="uppercase text-xs" style={{ color: it.type === "lost" ? "var(--destructive)" : "var(--color-line-green)", borderColor: it.type === "lost" ? "var(--destructive)" : "var(--color-line-green)" }}>{it.type}</Badge>
                    <span className="text-xs text-muted-foreground">{it.category} · {st?.name}</span>
                  </div>
                  <p className="mt-2 font-medium">{it.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{it.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(it.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserLink user={author as any} />
                      {author && <TrustBadge trustScore={author.trustScore} verified={author.verifiedBadge} />}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleContact(it.id, it.userId)}>
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" />{it.type === "lost" ? "I found it" : "I think this is mine"}
                    </Button>
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

function LostFoundCreateDialog({ onClose }: { onClose: () => void }) {
  const create = useStore((s) => s.createLostFound);
  const [type, setType] = useState<"lost" | "found">("lost");
  const [category, setCategory] = useState<string>("wallet");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stationId, setStationId] = useState("");
  const [eventDate, setEventDate] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !stationId || !eventDate) { toast.error("Fill in all fields"); return; }
    create({ type, category, title, description, stationId, eventDate: new Date(eventDate).toISOString() });
    toast.success("Posted");
    onClose();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Report a lost or found item</DialogTitle><DialogDescription>Your report appears on the station's feed instantly.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Type</Label><Select value={type} onValueChange={(v) => setType(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lost">I lost something</SelectItem><SelectItem value="found">I found something</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Black leather wallet with ID card" /></div>
        <div className="space-y-1.5"><Label htmlFor="desc">Description</Label><Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} /></div>
        <div className="space-y-1.5"><Label>Station</Label><StationSelect value={stationId} onChange={setStationId} autoFocus /></div>
        <div className="space-y-1.5"><Label htmlFor="date">When? (approx)</Label><Input id="date" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></div>
        <DialogFooter><Button type="submit">Post</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
