// MetroMitra client-side store.
// NO backend, NO database, NO API. All data lives in the browser via a
// Zustand store that is manually synced to localStorage (load on mount,
// save on change). We intentionally avoid zustand/middleware `persist`
// here because its hydration cycle interacts poorly with Next.js SSR and
// useSyncExternalStore, producing "getServerSnapshot" loop warnings.
// This is a demo: data is per-browser and does not sync across devices
// or survive a browser-data clear. See TechRD §10.

import { create } from "zustand";
import { useMemo, useEffect } from "react";
import { STATIONS } from "@/lib/stations-data";

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  city?: string;
  avatarUrl?: string;
  homeStationId?: string;
  workStationId?: string;
  travelWindow?: string;
  preferredLang: string;
  trustScore: number;
  verifiedBadge: boolean;
  createdAt: string;
};

export type Reply = { id: string; postId: string; authorId: string; body: string; createdAt: string };

export type Post = {
  id: string; authorId: string; stationId?: string | null; body: string;
  tag: "general" | "help" | "info" | "alert" | "meetup"; imageUrl?: string | null;
  createdAt: string; replies: Reply[];
};

export type CarpoolJoin = { id: string; userId: string; message?: string; status: "pending" | "accepted" | "declined"; createdAt: string };

export type Carpool = {
  id: string; authorId: string; type: "offer" | "request"; originStationId: string;
  destinationArea: string; departAt: string; seats: number; mode: "auto" | "cab" | "personal";
  costSplit: "share" | "fixed" | "free"; womenOnly: boolean; notes?: string;
  status: "open" | "matched" | "completed" | "expired"; createdAt: string; joins: CarpoolJoin[];
};

export type Idea = {
  id: string; authorId: string; stationId: string; title: string; description: string;
  category: "idea" | "feedback" | "cofounder" | "discussion" | "showcase";
  lookingFor: "co-founder" | "feedback" | "discussion" | "collaborator";
  stage: "just-an-idea" | "validating" | "building" | "launched";
  notes?: string; status: "open" | "matched" | "closed"; createdAt: string; interested: string[];
};

export type LostFound = {
  id: string; userId: string; type: "lost" | "found"; category: string; title: string;
  description: string; stationId: string; eventDate: string;
  status: "active" | "reunited" | "closed"; createdAt: string;
};

export type Marketplace = {
  id: string; userId: string; title: string; description: string; price: number;
  category: string; condition: "new" | "good" | "fair"; stationId: string;
  imageUrl?: string | null; status: "available" | "reserved" | "sold"; createdAt: string;
};

export type ContactRequest = {
  id: string; initiatorId: string; recipientId: string;
  contextType: "carpool" | "idea" | "lost_found" | "marketplace"; contextId: string;
  message?: string; status: "pending" | "accepted" | "declined"; createdAt: string;
};

export type Rating = {
  id: string; raterId: string; ratedId: string; contextType: string; contextId: string;
  score: number; note?: string; createdAt: string;
};

export type Report = {
  id: string; reporterId: string; subjectId: string; targetType: string; targetId: string;
  reason: string; status: "open" | "reviewed" | "dismissed" | "actioned"; createdAt: string;
};

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

// Lightweight synchronous hash for demo passwords. NOT secure — demo only.
// In a production build this would be a server-side bcrypt/argon2 hash.
function demoHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return `h$${(h >>> 0).toString(16)}`;
}
function verifyHash(s: string, stored: string): boolean {
  return demoHash(s) === stored;
}
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ───────────────────────────────────────────────────────────────
// Store shape
// ───────────────────────────────────────────────────────────────

type StoreState = {
  users: User[];
  currentUserId: string | null;
  posts: Post[];
  carpools: Carpool[];
  ideas: Idea[];
  lostFound: LostFound[];
  marketplace: Marketplace[];
  contactRequests: ContactRequest[];
  ratings: Rating[];
  reports: Report[];
  seeded: boolean;

  // auth
  register: (name: string, email: string, password: string, city?: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;

  // feed
  createPost: (body: string, tag: Post["tag"], stationId?: string | null) => void;
  createReply: (postId: string, body: string) => void;

  // carpools
  createCarpool: (c: Omit<Carpool, "id" | "authorId" | "createdAt" | "joins" | "status">) => void;
  joinCarpool: (carpoolId: string, message?: string) => { ok: boolean; error?: string };
  respondCarpoolJoin: (carpoolId: string, joinId: string, status: "accepted" | "declined") => void;
  updateCarpoolStatus: (carpoolId: string, status: Carpool["status"]) => void;

  // ideas
  createIdea: (i: Omit<Idea, "id" | "authorId" | "createdAt" | "interested" | "status">) => void;
  expressInterestInIdea: (ideaId: string, message?: string) => { ok: boolean; error?: string };
  updateIdeaStatus: (ideaId: string, status: Idea["status"]) => void;

  // lost & found
  createLostFound: (l: Omit<LostFound, "id" | "userId" | "createdAt" | "status">) => void;
  contactLostFound: (id: string, message?: string) => { ok: boolean; error?: string };
  updateLostFoundStatus: (id: string, status: LostFound["status"]) => void;

  // marketplace
  createMarketplace: (m: Omit<Marketplace, "id" | "userId" | "createdAt" | "status">) => void;
  contactMarketplace: (id: string, message?: string) => { ok: boolean; error?: string };
  updateMarketplaceStatus: (id: string, status: Marketplace["status"]) => void;

  // contacts + ratings + reports
  respondContact: (id: string, status: "accepted" | "declined") => void;
  rateUser: (ratedId: string, contextType: string, contextId: string, score: number, note?: string) => { ok: boolean; error?: string };
  reportContent: (subjectId: string, targetType: string, targetId: string, reason: string) => void;

  // demo lifecycle
  reseedDemo: () => void;
  clearAll: () => void;
};

// ───────────────────────────────────────────────────────────────
// Demo seed
// ───────────────────────────────────────────────────────────────

function demoSeed(): Partial<StoreState> {
  const now = Date.now();
  const iso = (offsetMin: number) => new Date(now - offsetMin * 60000).toISOString();
  const future = (days: number, hour = 19) => {
    const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, 30, 0, 0); return d.toISOString();
  };

  const devika: User = { id: "u-devika", name: "Devika Rao", email: "devika@metromitra.in", passwordHash: demoHash("password123"), bio: "Software engineer on the Purple Line. Exploring side projects between MG Road and Indiranagar.", city: "Bengaluru", homeStationId: "st-MGR", workStationId: "st-IND", travelWindow: "08:00-10:00, 18:00-20:00", preferredLang: "en", trustScore: 62, verifiedBadge: true, createdAt: iso(60 * 24 * 7) };
  const rohan: User = { id: "u-rohan", name: "Rohan Mehta", email: "rohan@metromitra.in", passwordHash: demoHash("password123"), bio: "New to Delhi. Yellow Line daily. Dwarka to Rajiv Chowk. Aspiring founder.", city: "Delhi", homeStationId: "st-DWRK", workStationId: "st-RJC", travelWindow: "09:00-10:30, 18:30-20:00", preferredLang: "en", trustScore: 48, verifiedBadge: true, createdAt: iso(60 * 24 * 5) };
  const anitha: User = { id: "u-anitha", name: "Anitha Sharma", email: "anitha@metromitra.in", passwordHash: demoHash("password123"), bio: "Consultant travelling to Mumbai monthly. Andheri regular. Always reading about D2C brands.", city: "Mumbai", homeStationId: "st-AND", preferredLang: "en", trustScore: 55, verifiedBadge: true, createdAt: iso(60 * 24 * 10) };

  const users = [devika, rohan, anitha];

  const posts: Post[] = [
    { id: "p1", authorId: "u-devika", stationId: "st-MGR", body: "Purple Line running on time this morning. Exit 3 has a long queue at the auto stand — try Exit 1.", tag: "info", createdAt: iso(180), replies: [] },
    { id: "p2", authorId: "u-rohan", stationId: "st-RJC", body: "Anyone know if the Dwarka line interchange at Rajiv Chowk is crowded after 6pm? First week commuting.", tag: "help", createdAt: iso(95), replies: [{ id: "r1", postId: "p2", authorId: "u-devika", body: "Tuesdays are heaviest around 6:30. Walk to platform 2 via the yellow line side — less crowded.", createdAt: iso(80) }] },
    { id: "p3", authorId: "u-anitha", stationId: null, body: "Reading 'The Mom Test' on the Andheri line this week. Anyone want to discuss validation tactics over coffee at a station café?", tag: "meetup", createdAt: iso(40), replies: [] },
  ];

  const carpools: Carpool[] = [
    { id: "c1", authorId: "u-devika", type: "offer", originStationId: "st-MGR", destinationArea: "Indiranagar 100ft Road", departAt: future(1, 19), seats: 2, mode: "auto", costSplit: "share", womenOnly: false, notes: "From MG Road Exit 3. ₹40 each via the back road.", status: "open", createdAt: iso(120), joins: [] },
    { id: "c2", authorId: "u-rohan", type: "request", originStationId: "st-RJC", destinationArea: "Connaught Place inner circle", departAt: future(0, 18), seats: 1, mode: "cab", costSplit: "share", womenOnly: false, notes: "Need to reach CP by 6:45.", status: "open", createdAt: iso(60), joins: [] },
  ];

  const ideas: Idea[] = [
    { id: "i1", authorId: "u-devika", stationId: "st-MGR", title: "Hyperlocal carpooling for metro last-mile", description: "What if the last-mile auto from a station could be split in real time with the 4 people walking out of the same gate? Thinking of an SMS-first MVP for auto drivers.", category: "idea", lookingFor: "co-founder", stage: "validating", notes: "I have early user interviews from MG Road commuters.", status: "open", createdAt: iso(200), interested: ["u-rohan"] },
    { id: "i2", authorId: "u-rohan", stationId: "st-RJC", title: "Station-area co-working pods", description: "Empty retail spaces near metro stations could become 30-minute focus pods for commuters between meetings. Looking for someone to stress-test the unit economics.", category: "feedback", lookingFor: "feedback", stage: "just-an-idea", status: "open", createdAt: iso(150), interested: [] },
    { id: "i3", authorId: "u-anitha", stationId: "st-AND", title: "D2C brand discovery for commuters", description: "A curated weekly drop of local D2C samples at a station kiosk. Validated demand informally. Want a technical co-founder to build the redemption flow.", category: "cofounder", lookingFor: "co-founder", stage: "building", status: "open", createdAt: iso(70), interested: ["u-devika"] },
  ];

  const lostFound: LostFound[] = [
    { id: "lf1", userId: "u-rohan", type: "lost", category: "wallet", title: "Black leather wallet with ID card", description: "Dropped between platform 2 and the exit at Rajiv Chowk around 9:15am. Has a Metro smart card and a college ID.", stationId: "st-RJC", eventDate: iso(60 * 24), status: "active", createdAt: iso(60 * 24) },
    { id: "lf2", userId: "u-devika", type: "found", category: "phone", title: "Found a phone near Exit 3, MG Road", description: "Red mid-range Android, locked. Found it on the bench by Exit 3 this morning. Describe the wallpaper to claim.", stationId: "st-MGR", eventDate: iso(300), status: "active", createdAt: iso(300) },
  ];

  const marketplace: Marketplace[] = [
    { id: "m1", userId: "u-devika", title: "Engineering maths textbook, barely used", description: "Semester 1-2 combined edition. No annotations. Pickup at MG Road station.", price: 450, category: "books", condition: "good", stationId: "st-MGR", status: "available", createdAt: iso(400) },
    { id: "m2", userId: "u-anitha", title: "Mi power bank 20000mAh", description: "Used for 6 months, works perfectly. Selling because I upgraded.", price: 1200, category: "electronics", condition: "good", stationId: "st-AND", status: "available", createdAt: iso(900) },
  ];

  const contactRequests: ContactRequest[] = [];
  const ratings: Rating[] = [];
  const reports: Report[] = [];

  return { users, posts, carpools, ideas, lostFound, marketplace, contactRequests, ratings, reports, seeded: true };
}

// ───────────────────────────────────────────────────────────────
// Trust score (client-side, explainable)
// ───────────────────────────────────────────────────────────────

function computeTrust(user: User, ratings: Rating[], contacts: ContactRequest[]): number {
  let score = 0;
  const profileComplete = !!(user.name && user.bio && user.city && (user.homeStationId || user.workStationId));
  if (profileComplete) score += 20;
  if (user.verifiedBadge) score += 10;
  const userRatings = ratings.filter((r) => r.ratedId === user.id);
  if (userRatings.length > 0) {
    const avg = userRatings.reduce((s, r) => s + r.score, 0) / userRatings.length;
    score += Math.round(avg * 4);
  }
  const completed = contacts.filter((c) => (c.initiatorId === user.id || c.recipientId === user.id) && c.status === "accepted").length;
  score += Math.min(completed * 5, 35);
  return Math.max(0, Math.min(100, score));
}

// ───────────────────────────────────────────────────────────────
// Store
// ───────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  (set, get) => ({
    users: [],
    currentUserId: null,
    posts: [],
      carpools: [],
      ideas: [],
      lostFound: [],
      marketplace: [],
      contactRequests: [],
      ratings: [],
      reports: [],
      seeded: false,

      register: (name, email, password, city) => {
        const e = email.toLowerCase().trim();
        if (get().users.some((u) => u.email === e)) return { ok: false, error: "An account with this email already exists" };
        const u: User = {
          id: uid(), name: name.trim(), email: e, passwordHash: demoHash(password),
          city, preferredLang: "en", trustScore: 0, verifiedBadge: false, createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, u], currentUserId: u.id }));
        return { ok: true };
      },
      login: (email, password) => {
        const e = email.toLowerCase().trim();
        const u = get().users.find((x) => x.email === e);
        if (!u || !verifyHash(password, u.passwordHash)) return { ok: false, error: "Invalid email or password" };
        set({ currentUserId: u.id });
        return { ok: true };
      },
      logout: () => set({ currentUserId: null }),
      updateProfile: (patch) => set((s) => {
        if (!s.currentUserId) return {};
        const users = s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u));
        const me = users.find((u) => u.id === s.currentUserId)!;
        const trust = computeTrust(me, s.ratings, s.contactRequests);
        const finalUsers = users.map((u) => (u.id === me.id ? { ...u, trustScore: trust } : u));
        return { users: finalUsers };
      }),

      createPost: (body, tag, stationId) => set((s) => {
        if (!s.currentUserId) return {};
        return { posts: [{ id: uid(), authorId: s.currentUserId, stationId: stationId ?? null, body, tag, createdAt: new Date().toISOString(), replies: [] }, ...s.posts] };
      }),
      createReply: (postId, body) => set((s) => {
        if (!s.currentUserId) return {};
        const meId = s.currentUserId;
        return { posts: s.posts.map((p) => p.id === postId ? { ...p, replies: [...p.replies, { id: uid(), postId, authorId: meId, body, createdAt: new Date().toISOString() }] } : p) };
      }),

      createCarpool: (c) => set((s) => {
        if (!s.currentUserId) return {};
        return { carpools: [{ ...c, id: uid(), authorId: s.currentUserId, status: "open", createdAt: new Date().toISOString(), joins: [] }, ...s.carpools] };
      }),
      joinCarpool: (carpoolId, message) => {
        const s = get();
        if (!s.currentUserId) return { ok: false, error: "Sign in first" };
        const cp = s.carpools.find((c) => c.id === carpoolId);
        if (!cp) return { ok: false, error: "Ride not found" };
        if (cp.authorId === s.currentUserId) return { ok: false, error: "You can't join your own ride" };
        if (cp.joins.some((j) => j.userId === s.currentUserId)) return { ok: false, error: "You already requested to join" };
        set((st) => ({ carpools: st.carpools.map((c) => c.id === carpoolId ? { ...c, joins: [...c.joins, { id: uid(), userId: st.currentUserId!, message, status: "pending", createdAt: new Date().toISOString() }] } : c) }));
        return { ok: true };
      },
      respondCarpoolJoin: (carpoolId, joinId, status) => set((s) => ({
        carpools: s.carpools.map((c) => c.id === carpoolId ? { ...c, joins: c.joins.map((j) => j.id === joinId ? { ...j, status } : j), status: status === "accepted" ? "matched" : c.status } : c),
      })),
      updateCarpoolStatus: (carpoolId, status) => set((s) => ({ carpools: s.carpools.map((c) => c.id === carpoolId ? { ...c, status } : c) })),

      createIdea: (i) => set((s) => {
        if (!s.currentUserId) return {};
        return { ideas: [{ ...i, id: uid(), authorId: s.currentUserId, status: "open", createdAt: new Date().toISOString(), interested: [] }, ...s.ideas] };
      }),
      expressInterestInIdea: (ideaId, message) => {
        const s = get();
        if (!s.currentUserId) return { ok: false, error: "Sign in first" };
        const idea = s.ideas.find((i) => i.id === ideaId);
        if (!idea) return { ok: false, error: "Idea not found" };
        if (idea.authorId === s.currentUserId) return { ok: false, error: "This is your own idea" };
        const cr: ContactRequest = { id: uid(), initiatorId: s.currentUserId, recipientId: idea.authorId, contextType: "idea", contextId: ideaId, message, status: "pending", createdAt: new Date().toISOString() };
        set((st) => ({ ideas: st.ideas.map((i) => i.id === ideaId ? { ...i, interested: [...i.interested, st.currentUserId!] } : i), contactRequests: [...st.contactRequests, cr] }));
        return { ok: true };
      },
      updateIdeaStatus: (ideaId, status) => set((s) => ({ ideas: s.ideas.map((i) => i.id === ideaId ? { ...i, status } : i) })),

      createLostFound: (l) => set((s) => {
        if (!s.currentUserId) return {};
        return { lostFound: [{ ...l, id: uid(), userId: s.currentUserId, status: "active", createdAt: new Date().toISOString() }, ...s.lostFound] };
      }),
      contactLostFound: (id, message) => {
        const s = get();
        if (!s.currentUserId) return { ok: false, error: "Sign in first" };
        const item = s.lostFound.find((x) => x.id === id);
        if (!item) return { ok: false, error: "Item not found" };
        if (item.userId === s.currentUserId) return { ok: false, error: "This is your own listing" };
        const cr: ContactRequest = { id: uid(), initiatorId: s.currentUserId, recipientId: item.userId, contextType: "lost_found", contextId: id, message, status: "pending", createdAt: new Date().toISOString() };
        set((st) => ({ contactRequests: [...st.contactRequests, cr] }));
        return { ok: true };
      },
      updateLostFoundStatus: (id, status) => set((s) => ({ lostFound: s.lostFound.map((l) => l.id === id ? { ...l, status } : l) })),

      createMarketplace: (m) => set((s) => {
        if (!s.currentUserId) return {};
        return { marketplace: [{ ...m, id: uid(), userId: s.currentUserId, status: "available", createdAt: new Date().toISOString() }, ...s.marketplace] };
      }),
      contactMarketplace: (id, message) => {
        const s = get();
        if (!s.currentUserId) return { ok: false, error: "Sign in first" };
        const item = s.marketplace.find((x) => x.id === id);
        if (!item) return { ok: false, error: "Listing not found" };
        if (item.userId === s.currentUserId) return { ok: false, error: "This is your own listing" };
        const cr: ContactRequest = { id: uid(), initiatorId: s.currentUserId, recipientId: item.userId, contextType: "marketplace", contextId: id, message, status: "pending", createdAt: new Date().toISOString() };
        set((st) => ({ contactRequests: [...st.contactRequests, cr] }));
        return { ok: true };
      },
      updateMarketplaceStatus: (id, status) => set((s) => ({ marketplace: s.marketplace.map((m) => m.id === id ? { ...m, status } : m) })),

      respondContact: (id, status) => set((s) => ({ contactRequests: s.contactRequests.map((c) => c.id === id ? { ...c, status } : c) })),
      rateUser: (ratedId, contextType, contextId, score, note) => {
        const s = get();
        if (!s.currentUserId) return { ok: false, error: "Sign in first" };
        if (ratedId === s.currentUserId) return { ok: false, error: "You can't rate yourself" };
        if (s.ratings.some((r) => r.raterId === s.currentUserId && r.contextId === contextId)) return { ok: false, error: "You already rated this" };
        const r: Rating = { id: uid(), raterId: s.currentUserId, ratedId, contextType, contextId, score, note, createdAt: new Date().toISOString() };
        const ratings = [...s.ratings, r];
        const rated = s.users.find((u) => u.id === ratedId);
        const trust = rated ? computeTrust(rated, ratings, s.contactRequests) : 0;
        set({ ratings, users: s.users.map((u) => u.id === ratedId ? { ...u, trustScore: trust } : u) });
        return { ok: true };
      },
      reportContent: (subjectId, targetType, targetId, reason) => set((s) => {
        if (!s.currentUserId) return {};
        return { reports: [...s.reports, { id: uid(), reporterId: s.currentUserId, subjectId, targetType, targetId, reason, status: "open", createdAt: new Date().toISOString() }] };
      }),

      reseedDemo: () => set({ ...demoSeed(), currentUserId: null }),
      clearAll: () => set({ users: [], currentUserId: null, posts: [], carpools: [], ideas: [], lostFound: [], marketplace: [], contactRequests: [], ratings: [], reports: [], seeded: true }),
    })
);

// ───────────────────────────────────────────────────────────────
// localStorage sync (manual, SSR-safe)
// ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "metromitra-store";

function loadFromStorage(): Partial<StoreState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<StoreState>;
  } catch { return null; }
}

function saveToStorage(state: StoreState) {
  if (typeof window === "undefined") return;
  try {
    const { users, currentUserId, posts, carpools, ideas, lostFound, marketplace, contactRequests, ratings, reports, seeded } = state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId, posts, carpools, ideas, lostFound, marketplace, contactRequests, ratings, reports, seeded }));
  } catch { /* storage full or unavailable */ }
}

// Load persisted state (or seed demo content) on the client, once.
if (typeof window !== "undefined") {
  const persisted = loadFromStorage();
  if (persisted && persisted.seeded) {
    useStore.setState({ ...persisted } as Partial<StoreState>);
  } else {
    useStore.setState({ ...demoSeed() } as Partial<StoreState>);
  }
  // Subscribe to changes and persist.
  useStore.subscribe((state) => saveToStorage(state));
}

// React hook to ensure the store is hydrated on the client. Call this once
// near the root (in Providers) so the first client render reflects stored data.
export function useEnsureHydrated() {
  useEffect(() => {
    // Hydration already happened at module load; this is a no-op placeholder
    // kept for clarity and potential future lazy hydration.
  }, []);
}

// ───────────────────────────────────────────────────────────────
// Selector helpers
// ───────────────────────────────────────────────────────────────

export function useCurrentUser(): User | null {
  // Select primitives (stable) and derive the user object with useMemo.
  // Returning an object directly from a useStore selector can trigger
  // useSyncExternalStore loops when the underlying array reference changes
  // during persist hydration.
  const currentUserId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  return useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );
}

// Hook returning a stable id→user map. Selecting the users array (stable
// reference) and memoising avoids the infinite-loop warning that comes from
// returning a fresh object from a selector on every render.
export function useUsersById(): Record<string, User> {
  const users = useStore((s) => s.users);
  return useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
}

export function getStationById(id: string | null | undefined) {
  if (!id) return null;
  return STATIONS.find((s) => s.id === id) ?? null;
}
