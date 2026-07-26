"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/site/app-shell";
import { apiFetch } from "@/lib/api-fetch";
import { StationSelect } from "@/components/shared/station-select";
import { TrustBadge, UserLink, EmptyState, TimeAgo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Reply } from "lucide-react";

type Post = {
  id: string; body: string; tag: string; imageUrl: string | null; createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null; verifiedBadge: boolean; trustScore: number };
  station: { id: string; code: string; name: string; city: string } | null;
  _count: { replies: number };
};

const TAGS = [
  { value: "general", label: "General" },
  { value: "help", label: "Help" },
  { value: "info", label: "Info" },
  { value: "alert", label: "Alert" },
  { value: "meetup", label: "Meetup" },
] as const;

export default function FeedPage() {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<string>("general");
  const [stationId, setStationId] = useState<string>("");
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: () => apiFetch<Post[]>("/api/feed"),
  });

  const postMut = useMutation({
    mutationFn: () => apiFetch("/api/feed", {
      method: "POST",
      body: JSON.stringify({ body, tag, stationId: stationId || null }),
    }),
    onSuccess: () => {
      toast.success("Posted");
      setBody(""); setTag("general"); setStationId("");
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell
      title="Community feed"
      description="Talk to your station community. Ask, share, alert, organise."
    >
      <Card className="mb-6">
        <CardContent className="p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); if (!body.trim()) return; postMut.mutate(); }}
            className="space-y-3"
          >
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's happening at your station?"
              maxLength={1000}
              rows={3}
              aria-label="Post body"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="tag" className="text-xs">Tag</Label>
                  <Select value={tag} onValueChange={setTag}>
                    <SelectTrigger id="tag" className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TAGS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Station <span className="text-muted-foreground">(optional)</span></Label>
                  <StationSelect value={stationId} onChange={setStationId} placeholder="Global feed" />
                </div>
              </div>
              <Button type="submit" disabled={postMut.isPending || !body.trim()} size="sm">
                <Send className="mr-1.5 h-4 w-4" /> Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No posts yet" description="Start the conversation." />
      ) : (
        <div className="space-y-3">
          {data.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserLink user={p.author} />
                    <TrustBadge trustScore={p.author.trustScore} verified={p.author.verifiedBadge} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">#{p.tag}</Badge>
                    <span className="text-xs text-muted-foreground"><TimeAgo date={p.createdAt} /></span>
                  </div>
                </div>
                {p.station && (
                  <p className="mt-1 text-xs text-muted-foreground">at {p.station.name} ({p.station.code})</p>
                )}
                <p className="mt-2 whitespace-pre-wrap text-sm">{p.body}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setOpenReplies((s) => ({ ...s, [p.id]: !s[p.id] }))}
                  >
                    <Reply className="mr-1.5 h-3.5 w-3.5" />
                    {p._count.replies} {p._count.replies === 1 ? "reply" : "replies"}
                  </Button>
                </div>
                {openReplies[p.id] && <ReplyList postId={p.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ReplyList({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const { data } = useQuery({
    queryKey: ["replies", postId],
    queryFn: () => apiFetch<any[]>(`/api/feed/${postId}/replies`),
  });
  const replyMut = useMutation({
    mutationFn: () => apiFetch(`/api/feed/${postId}/reply`, { method: "POST", body: JSON.stringify({ body: text }) }),
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["replies", postId] }); qc.invalidateQueries({ queryKey: ["feed"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="mt-3 border-l-2 border-border pl-3">
      {(data ?? []).length === 0 && <p className="text-xs text-muted-foreground">No replies yet.</p>}
      {(data ?? []).map((r: any) => (
        <div key={r.id} className="py-1.5 text-sm">
          <div className="flex items-center gap-2">
            <UserLink user={r.author} />
            <span className="text-xs text-muted-foreground"><TimeAgo date={r.createdAt} /></span>
          </div>
          <p className="mt-0.5">{r.body}</p>
        </div>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; replyMut.mutate(); }} className="mt-2 flex gap-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="text-sm" placeholder="Write a reply…" />
        <Button type="submit" size="sm" disabled={replyMut.isPending || !text.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
