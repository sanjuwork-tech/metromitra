"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/site/app-shell";
import { apiFetch } from "@/lib/api-fetch";
import { StationSelect } from "@/components/shared/station-select";
import { TrustBadge, UserLink, EmptyState, formatINR } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, HandHeart, MessageSquare } from "lucide-react";

type Listing = {
  id: string; title: string; description: string; price: number; category: string;
  condition: string; imageUrl: string | null; status: string;
  user: { id: string; name: string; avatarUrl: string | null; verifiedBadge: boolean; trustScore: number };
  station: { id: string; code: string; name: string; city: string };
};

const CATEGORIES = [
  { value: "books", label: "Books & study" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "household", label: "Household" },
  { value: "tickets", label: "Tickets / passes" },
  { value: "other", label: "Other" },
] as const;

export default function MarketplacePage() {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<string>("");
  const { data, isLoading } = useQuery({
    queryKey: ["marketplace", cat],
    queryFn: () => {
      const q = new URLSearchParams();
      if (cat) q.set("category", cat);
      return apiFetch<Listing[]>(cat ? `/api/marketplace?${q}` : "/api/marketplace");
    },
  });

  return (
    <AppShell
      title="Marketplace"
      description="Buy and sell within your commuter community. No payments through the app."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> List an item</Button>
          </DialogTrigger>
          <ListingCreateDialog onClose={() => setOpen(false)} />
        </Dialog>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant={!cat ? "default" : "outline"} onClick={() => setCat("")}>All</Button>
        {CATEGORIES.map((c) => (
          <Button key={c.value} size="sm" variant={cat === c.value ? "default" : "outline"} onClick={() => setCat(c.value)}>{c.label}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-44 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Sell something to your station community — books, electronics, furniture."
          action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> List an item</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((l) => (
            <Card key={l.id}>
              <CardContent className="p-4">
                {l.imageUrl ? (
                  <img src={l.imageUrl} alt={l.title} className="mb-3 h-32 w-full rounded-md object-cover" />
                ) : (
                  <div className="mb-3 grid h-32 place-items-center rounded-md bg-muted">
                    <HandHeart className="h-8 w-8 text-muted-foreground" aria-hidden />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{l.title}</p>
                  <p className="shrink-0 font-semibold text-primary">{formatINR(l.price)}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{l.condition}</Badge>
                  <span className="text-xs text-muted-foreground">{l.station.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserLink user={l.user} />
                    <TrustBadge trustScore={l.user.trustScore} verified={l.user.verifiedBadge} />
                  </div>
                  <ContactListingButton listing={l} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ContactListingButton({ listing }: { listing: Listing }) {
  const mut = useMutation({
    mutationFn: () => apiFetch(`/api/marketplace/${listing.id}/contact`, {
      method: "POST",
      body: JSON.stringify({ message: "I'm interested. Is it still available?" }),
    }),
    onSuccess: () => toast.success("Interest sent to seller"),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Button size="sm" variant="outline" onClick={() => mut.mutate()} disabled={mut.isPending}>
      <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> I'm interested
    </Button>
  );
}

function ListingCreateDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("books");
  const [condition, setCondition] = useState<string>("good");
  const [stationId, setStationId] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const mut = useMutation({
    mutationFn: () => apiFetch("/api/marketplace", {
      method: "POST",
      body: JSON.stringify({
        title, description, price: Number(price), category, condition, stationId,
        imageUrl: imageUrl || null,
      }),
    }),
    onSuccess: () => {
      toast.success("Listing posted");
      qc.invalidateQueries({ queryKey: ["marketplace"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !price || !stationId) { toast.error("Fill in all fields"); return; }
    mut.mutate();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>List an item</DialogTitle>
        <DialogDescription>Buyers contact you through the app. Meet in a public station area.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Engineering maths textbook, barely used" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="500" />
          </div>
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Station</Label>
            <StationSelect value={stationId} onChange={setStationId} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="img">Image URL <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Posting…" : "Post listing"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
