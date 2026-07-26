"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/site/app-shell";
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
import { Save, Inbox, Check, X, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { useStore, useUsersById, getStationById } from "@/lib/store";

type ContactReq = {
  id: string; status: string; message?: string; createdAt: string;
  initiatorId: string; contextType: string; contextId: string;
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const contacts = useStore((s) => s.contactRequests);
  const usersById = useUsersById();
  const respondContact = useStore((s) => s.respondContact);
  const reseedDemo = useStore((s) => s.reseedDemo);
  const clearAll = useStore((s) => s.clearAll);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [homeStationId, setHome] = useState("");
  const [workStationId, setWork] = useState("");
  const [travelWindow, setTravelWindow] = useState("");

  // Sync form fields when the logged-in user changes (e.g. after login).
  useEffect(() => {
    if (user) {
      setName(user.name); setBio(user.bio ?? ""); setCity(user.city ?? "");
      setHome(user.homeStationId ?? ""); setWork(user.workStationId ?? "");
      setTravelWindow(user.travelWindow ?? "");
    }
  }, [user]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ name, bio: bio || undefined, city: city || undefined, homeStationId: homeStationId || undefined, workStationId: workStationId || undefined, travelWindow: travelWindow || undefined });
    toast.success("Profile saved");
  }

  if (!user) {
    return <AppShell title="Profile"><div className="h-64 animate-pulse rounded-lg bg-muted" /></AppShell>;
  }

  const incoming = contacts.filter((c) => c.recipientId === user.id && c.status === "pending");
  const outgoing = contacts.filter((c) => c.initiatorId === user.id);

  return (
    <AppShell title="Your profile" description="Set your stations so the community can find you.">
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Profile</TabsTrigger>
          <TabsTrigger value="inbox">Inbox {incoming.length ? <Badge className="ml-2" variant="default">{incoming.length}</Badge> : null}</TabsTrigger>
          <TabsTrigger value="data">Demo data</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={save} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor="city">City</Label><Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" /></div>
                  </div>
                  <div className="space-y-1.5"><Label htmlFor="bio">Bio <span className="text-muted-foreground">(max 280 chars)</span></Label><Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={3} /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Home station</Label><StationSelect value={homeStationId} onChange={setHome} placeholder="Where you start your day" /></div>
                    <div className="space-y-1.5"><Label>Work / college station</Label><StationSelect value={workStationId} onChange={setWork} placeholder="Where you commute to" /></div>
                  </div>
                  <div className="space-y-1.5"><Label htmlFor="tw">Usual travel window</Label><Input id="tw" value={travelWindow} onChange={(e) => setTravelWindow(e.target.value)} placeholder="e.g. 08:00-10:00, 18:00-20:00" /></div>
                  <Button type="submit"><Save className="mr-1.5 h-4 w-4" /> Save profile</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Trust</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Trust score</span><TrustBadge trustScore={user.trustScore} verified={user.verifiedBadge} size="default" /></div>
                <p className="text-xs text-muted-foreground">Your score grows as you complete your profile, finish interactions, and earn ratings. It is shown next to your name on every post and listing.</p>
                <div className="rounded-md bg-muted/50 p-3 text-xs"><p className="font-medium">Email</p><p className="mt-0.5 text-muted-foreground">{user.email}</p></div>
                <div className="rounded-md bg-muted/50 p-3 text-xs"><p className="font-medium">Member since</p><p className="mt-0.5 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("en-IN")}</p></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inbox" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Inbox className="h-4 w-4" /> Contact requests</CardTitle></CardHeader>
            <CardContent>
              {incoming.length === 0 ? (
                <EmptyState title="No pending requests" description="When someone wants to contact you about a ride, idea, or item, it appears here." />
              ) : (
                <div className="space-y-3">
                  {incoming.map((c) => {
                    const initiator = usersById[c.initiatorId];
                    return (
                      <div key={c.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm"><span className="font-medium">{initiator?.name ?? "Someone"}</span>{initiator?.verifiedBadge && <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>}<span className="ml-2 text-xs text-muted-foreground">via {c.contextType}</span></p>
                          {c.message && <p className="mt-1 text-sm text-muted-foreground">"{c.message}"</p>}
                          <p className="mt-1 text-xs text-muted-foreground"><TimeAgo date={c.createdAt} /></p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <Button size="sm" onClick={() => respondContact(c.id, "accepted")}><Check className="h-4 w-4" /><span className="sr-only">Accept</span></Button>
                          <Button size="sm" variant="outline" onClick={() => respondContact(c.id, "declined")}><X className="h-4 w-4" /><span className="sr-only">Decline</span></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {outgoing.length > 0 && (
                <>
                  <div className="my-4 h-px bg-border" />
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Sent by you</p>
                  <div className="space-y-2">
                    {outgoing.slice(0, 8).map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                        <span>{c.contextType}</span>
                        <Badge variant="outline" className="text-xs">{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Demo data controls</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                MetroMitra runs entirely in your browser — there is no backend or database. All posts, rides, ideas,
                listings and accounts live in this browser&rsquo;s localStorage. Use these controls to reset the demo.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => { reseedDemo(); toast.success("Demo data restored"); }}>
                  <RefreshCw className="mr-1.5 h-4 w-4" /> Restore demo content
                </Button>
                <Button variant="outline" onClick={() => { if (confirm("Clear ALL local data and sign out?")) { clearAll(); toast.success("All local data cleared"); } }}>
                  <X className="mr-1.5 h-4 w-4" /> Clear all local data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
