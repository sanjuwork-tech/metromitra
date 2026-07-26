"use client";
import { useState } from "react";
import { AppShell } from "@/components/site/app-shell";
import { StationSelect } from "@/components/shared/station-select";
import { TrustBadge, UserLink, EmptyState, TimeAgo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Lightbulb, MessageSquare, Sparkles } from "lucide-react";
import { useStore, useUsersById } from "@/lib/store";
import { useAuth } from "@/lib/auth-client";
import { STATIONS } from "@/lib/stations-data";

const CATEGORIES = [
  { value: "idea", label: "Idea" },
  { value: "feedback", label: "Seeking feedback" },
  { value: "cofounder", label: "Looking for co-founder" },
  { value: "discussion", label: "Discussion topic" },
  { value: "showcase", label: "Showcase" },
] as const;

const LOOKING_FOR = ["co-founder", "feedback", "discussion", "collaborator"] as const;
const STAGES = [
  { value: "just-an-idea", label: "Just an idea" },
  { value: "validating", label: "Validating" },
  { value: "building", label: "Building" },
  { value: "launched", label: "Launched" },
] as const;

export default function IdeasPage() {
  const ideas = useStore((s) => s.ideas);
  const usersById = useUsersById();
  const expressInterest = useStore((s) => s.expressInterestInIdea);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("");

  const list = ideas.filter((i) => i.status === "open" && (!filter || i.category === filter));

  function handleInterest(id: string, authorId: string) {
    if (!user) { toast.error("Sign in to start a discussion"); return; }
    if (authorId === user.id) { toast.error("This is your own idea"); return; }
    const res = expressInterest(id, "I'd love to discuss this further. Are you free this week?");
    if (res.ok) toast.success("Discussion request sent"); else toast.error(res.error || "Could not send");
  }

  return (
    <AppShell
      title="Idea Junction"
      description="Where commute meets co-founding. Post entrepreneurial ideas and find collaborators among the people riding your line."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Share an idea</Button></DialogTrigger>
          <IdeaCreateDialog onClose={() => setOpen(false)} />
        </Dialog>
      }
    >
      {/* Why this exists — a short framing band, not a generic hero */}
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-medium">The metro is India's biggest unplanned founder mixer.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every day, millions of young professionals, students and aspiring entrepreneurs ride the same lines —
              and never speak. Idea Junction anchors entrepreneurial thought to your station so the person two seats
              away could be your co-founder, your first user, or the one who pokes a hole in your assumption.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant={!filter ? "default" : "outline"} onClick={() => setFilter("")}>All</Button>
        {CATEGORIES.map((c) => (
          <Button key={c.value} size="sm" variant={filter === c.value ? "default" : "outline"} onClick={() => setFilter(c.value)}>{c.label}</Button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No ideas posted yet"
          description="Share the first idea from your station. It doesn't have to be polished — a half-formed thought is enough."
          action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Share an idea</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {list.map((i) => {
            const st = STATIONS.find((s) => s.id === i.stationId);
            const author = usersById[i.authorId];
            return (
              <Card key={i.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="text-xs">{i.category}</Badge>
                    <Badge variant="outline" className="text-xs">looking for: {i.lookingFor}</Badge>
                    <Badge variant="outline" className="text-xs">{i.stage}</Badge>
                    {i.interested.length > 0 && <span className="text-xs text-muted-foreground">{i.interested.length} interested</span>}
                  </div>
                  <h3 className="mt-2 font-semibold">{i.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
                  {i.notes && <p className="mt-1 text-xs text-muted-foreground">{i.notes}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserLink user={author as any} />
                      {author && <TrustBadge trustScore={author.trustScore} verified={author.verifiedBadge} />}
                      <span className="text-xs text-muted-foreground">· {st?.name} · <TimeAgo date={i.createdAt} /></span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleInterest(i.id, i.authorId)}>
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Let's discuss
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

function IdeaCreateDialog({ onClose }: { onClose: () => void }) {
  const createIdea = useStore((s) => s.createIdea);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("idea");
  const [lookingFor, setLookingFor] = useState<string>("discussion");
  const [stage, setStage] = useState<string>("just-an-idea");
  const [stationId, setStationId] = useState("");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !stationId) { toast.error("Fill in title, description and station"); return; }
    createIdea({ title, description, category: category as any, lookingFor: lookingFor as any, stage: stage as any, stationId, notes: notes || undefined });
    toast.success("Idea shared");
    onClose();
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Share an idea</DialogTitle>
        <DialogDescription>A half-formed thought is fine. Anchor it to your station and see who bites.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Real-time auto pooling from metro exits" /></div>
        <div className="space-y-1.5"><Label htmlFor="desc">The idea, in a few lines</Label><Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="What's the problem? What's the rough shape of a solution? What's your hypothesis?" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5">
            <Label>Looking for</Label>
            <Select value={lookingFor} onValueChange={setLookingFor}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LOOKING_FOR.map((l) => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Stage</Label>
            <Select value={stage} onValueChange={setStage}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5">
            <Label>Station</Label>
            <StationSelect value={stationId} onChange={setStationId} />
          </div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="What you've done so far, what you need, links, etc." /></div>
        <DialogFooter><Button type="submit"><Lightbulb className="mr-1.5 h-4 w-4" /> Share idea</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
