"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/site/app-shell";
import { apiFetch } from "@/lib/api-fetch";
import { StationSelect } from "@/components/shared/station-select";
import { TrustBadge, EmptyState, TimeAgo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Inbox, Check, X } from "lucide-react";

type Me = {
  id: string; name: string; email: string; bio: string | null; city: string | null;
  trustScore: number; verifiedBadge: boolean; preferredLang: string;
  travelWindow: string | null;
  homeStation: { id: string; code: string; name: string; city: string } | null;
  workStation: { id: string; code: string; name: string; city: string } | null;
};

type ContactReq = {
  id: string; status: string; message: string | null; createdAt: string;
  initiator: { id: string; name: string; avatarUrl: string | null; verifiedBadge: boolean; trustScore: number };
  contextType: string; contextId: string;
};

export default function ProfilePage() {
  const qc = useQueryClient();
  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<Me>("/api/me"),
  });
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [homeStationId, setHome] = useState("");
  const [workStationId, setWork] = useState("");
  const [travelWindow, setTravelWindow] = useState("");

  useEffect(() => {
    if (me) {
      setName(me.name); setBio(me.bio ?? ""); setCity(me.city ?? "");
      setHome(me.homeStation?.id ?? ""); setWork(me.workStation?.id ?? "");
      setTravelWindow(me.travelWindow ?? "");
    }
  }, [me]);

  const saveMut = useMutation({
    mutationFn: () => apiFetch("/api/me", {
      method: "PATCH",
      body: JSON.stringify({
        name, bio: bio || null, city: city || null,
        homeStationId: homeStationId || null,
        workStationId: workStationId || null,
        travelWindow: travelWindow || null,
      }),
    }),
    onSuccess: () => { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["me"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiFetch<{ incoming: ContactReq[]; outgoing: ContactReq[] }>("/api/contacts"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveMut.mutate();
  }

  if (isLoading || !me) {
    return <AppShell title="Profile"><div className="h-64 animate-pulse rounded-lg bg-muted" /></AppShell>;
  }

  return (
    <AppShell title="Your profile" description="Set your stations so the community can find you.">
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Profile</TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox
            {contacts?.incoming?.length ? <Badge className="ml-2" variant="default">{contacts.incoming.length}</Badge> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bio">Bio <span className="text-muted-foreground">(max 280 chars)</span></Label>
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={3} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Home station</Label>
                      <StationSelect value={homeStationId} onChange={setHome} placeholder="Where you start your day" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Work / college station</Label>
                      <StationSelect value={workStationId} onChange={setWork} placeholder="Where you commute to" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tw">Usual travel window</Label>
                    <Input id="tw" value={travelWindow} onChange={(e) => setTravelWindow(e.target.value)} placeholder="e.g. 08:00-10:00, 18:00-20:00" />
                  </div>
                  <Button type="submit" disabled={saveMut.isPending}>
                    <Save className="mr-1.5 h-4 w-4" /> {saveMut.isPending ? "Saving…" : "Save profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Trust</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trust score</span>
                  <TrustBadge trustScore={me.trustScore} verified={me.verifiedBadge} size="default" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your score grows as you complete your profile, finish interactions, and earn ratings.
                  It is shown next to your name on every post and listing.
                </p>
                <div className="rounded-md bg-muted/50 p-3 text-xs">
                  <p className="font-medium">Email</p>
                  <p className="mt-0.5 text-muted-foreground">{me.email}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3 text-xs">
                  <p className="font-medium">Member since</p>
                  <p className="mt-0.5 text-muted-foreground">{new Date(me.id ? Date.now() : Date.now()).toLocaleDateString("en-IN")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inbox" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Inbox className="h-4 w-4" /> Contact requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!contacts?.incoming?.length ? (
                <EmptyState title="No pending requests" description="When someone wants to contact you about a ride, item, or buddy match, it appears here." />
              ) : (
                <div className="space-y-3">
                  {contacts.incoming.map((c) => (
                    <ContactRow key={c.id} c={c} />
                  ))}
                </div>
              )}
              {contacts?.outgoing?.length ? (
                <>
                  <div className="my-4 h-px bg-border" />
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Sent by you</p>
                  <div className="space-y-2">
                    {contacts.outgoing.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                        <span>{c.contextType}</span>
                        <Badge variant="outline" className="text-xs">{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ContactRow({ c }: { c: ContactReq }) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (status: "accepted" | "declined") => apiFetch(`/api/contacts/${c.id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["contacts"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{c.initiator.name}</span>
          {c.initiator.verifiedBadge && <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>}
          <span className="ml-2 text-xs text-muted-foreground">via {c.contextType}</span>
        </p>
        {c.message && <p className="mt-1 text-sm text-muted-foreground">"{c.message}"</p>}
        <p className="mt-1 text-xs text-muted-foreground"><TimeAgo date={c.createdAt} /></p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button size="sm" onClick={() => mut.mutate("accepted")} disabled={mut.isPending}>
          <Check className="h-4 w-4" /> <span className="sr-only">Accept</span>
        </Button>
        <Button size="sm" variant="outline" onClick={() => mut.mutate("declined")} disabled={mut.isPending}>
          <X className="h-4 w-4" /> <span className="sr-only">Decline</span>
        </Button>
      </div>
    </div>
  );
}
