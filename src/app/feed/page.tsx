"use client";
import { useState } from "react";
import { AppShell } from "@/components/site/app-shell";
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
import { useStore, useUsersById } from "@/lib/store";
import { useAuth } from "@/lib/auth-client";
import { STATIONS } from "@/lib/stations-data";

const TAGS = [
  { value: "general", label: "General" },
  { value: "help", label: "Help" },
  { value: "info", label: "Info" },
  { value: "alert", label: "Alert" },
  { value: "meetup", label: "Meetup" },
] as const;

export default function FeedPage() {
  const posts = useStore((s) => s.posts);
  const usersById = useUsersById();
  const createPost = useStore((s) => s.createPost);
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<string>("general");
  const [stationId, setStationId] = useState<string>("");
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Sign in to post"); return; }
    if (!body.trim()) return;
    createPost(body, tag as any, stationId || null);
    setBody(""); setTag("general"); setStationId("");
    toast.success("Posted");
  }

  return (
    <AppShell title="Community feed" description="Talk to your station community. Ask, share, alert, organise.">
      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={submit} className="space-y-3">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={user ? "What's happening at your station?" : "Sign in to post…"} maxLength={1000} rows={3} aria-label="Post body" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="tag" className="text-xs">Tag</Label>
                  <Select value={tag} onValueChange={setTag}><SelectTrigger id="tag" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{TAGS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Station <span className="text-muted-foreground">(optional)</span></Label>
                  <StationSelect value={stationId} onChange={setStationId} placeholder="Global feed" />
                </div>
              </div>
              <Button type="submit" disabled={!user || !body.trim()} size="sm"><Send className="mr-1.5 h-4 w-4" /> Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" description="Start the conversation." />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const author = usersById[p.authorId];
            const st = STATIONS.find((s) => s.id === (p.stationId ?? ""));
            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserLink user={author as any} />
                      {author && <TrustBadge trustScore={author.trustScore} verified={author.verifiedBadge} />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">#{p.tag}</Badge>
                      <span className="text-xs text-muted-foreground"><TimeAgo date={p.createdAt} /></span>
                    </div>
                  </div>
                  {st && <p className="mt-1 text-xs text-muted-foreground">at {st.name} ({st.code})</p>}
                  <p className="mt-2 whitespace-pre-wrap text-sm">{p.body}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpenReplies((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                      <Reply className="mr-1.5 h-3.5 w-3.5" />{p.replies.length} {p.replies.length === 1 ? "reply" : "replies"}
                    </Button>
                  </div>
                  {openReplies[p.id] && <ReplyList postId={p.id} replies={p.replies} usersById={usersById} />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function ReplyList({ postId, replies, usersById }: { postId: string; replies: any[]; usersById: Record<string, any> }) {
  const createReply = useStore((s) => s.createReply);
  const { user } = useAuth();
  const [text, setText] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Sign in to reply"); return; }
    if (!text.trim()) return;
    createReply(postId, text);
    setText("");
  }

  return (
    <div className="mt-3 border-l-2 border-border pl-3">
      {replies.length === 0 && <p className="text-xs text-muted-foreground">No replies yet.</p>}
      {replies.map((r) => (
        <div key={r.id} className="py-1.5 text-sm">
          <div className="flex items-center gap-2">
            <UserLink user={usersById[r.authorId] as any} />
            <span className="text-xs text-muted-foreground"><TimeAgo date={r.createdAt} /></span>
          </div>
          <p className="mt-0.5">{r.body}</p>
        </div>
      ))}
      <form onSubmit={submit} className="mt-2 flex gap-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="text-sm" placeholder={user ? "Write a reply…" : "Sign in to reply…"} />
        <Button type="submit" size="sm" disabled={!user || !text.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
