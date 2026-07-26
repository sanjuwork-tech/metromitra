// Static reference data of major Indian metro stations across six cities.
// Stations are real, operational metro stations researched from public
// DMRC, MMRCL, BMRCL, HMRL, CMRL and Metro Railway (Kolkata) sources.
// Codes are short, readable identifiers (not official station codes).
// Line colours map to the real metro line palette and are used semantically.
// `id` is a stable derived identifier (st-<CODE>) used by the local store.

export type StationSeed = {
  id: string;
  code: string;
  name: string;
  city: string;
  lines: string;
  lineColors: string;
  exitCount?: number;
};

type RawStation = Omit<StationSeed, "id">;

const RAW_STATIONS: RawStation[] = [
  // ── Delhi / NCR (DMRC + Rapid Metro) — 16 stations ────────────
  { code: "RJC", name: "Rajiv Chowk", city: "Delhi", lines: "Blue,Yellow", lineColors: "blue,yellow", exitCount: 8 },
  { code: "KASH", name: "Kashmere Gate", city: "Delhi", lines: "Red,Yellow,Violet", lineColors: "red,yellow,violet", exitCount: 6 },
  { code: "NDLS", name: "New Delhi", city: "Delhi", lines: "Yellow,Orange", lineColors: "yellow,orange", exitCount: 4 },
  { code: "CSK", name: "Rajendra Place", city: "Delhi", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "DWRK", name: "Dwarka Sector 8", city: "Delhi", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "NDA", name: "Noida City Centre", city: "Delhi", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "BOT", name: "Botanical Garden", city: "Delhi", lines: "Blue,Magenta", lineColors: "blue,magenta", exitCount: 3 },
  { code: "SCT", name: "Saket", city: "Delhi", lines: "Yellow", lineColors: "yellow", exitCount: 2 },
  { code: "HND", name: "Hauz Khas", city: "Delhi", lines: "Yellow,Magenta", lineColors: "yellow,magenta", exitCount: 3 },
  { code: "GNR", name: "HUDA City Centre", city: "Delhi", lines: "Yellow", lineColors: "yellow", exitCount: 3 },
  { code: "AIRP", name: "IGI Airport", city: "Delhi", lines: "Orange", lineColors: "orange", exitCount: 4 },
  { code: "CSEC", name: "Central Secretariat", city: "Delhi", lines: "Yellow,Violet", lineColors: "yellow,violet", exitCount: 4 },
  { code: "MH", name: "Mandi House", city: "Delhi", lines: "Blue,Violet", lineColors: "blue,violet", exitCount: 3 },
  { code: "LNP", name: "Lajpat Nagar", city: "Delhi", lines: "Violet,Pink", lineColors: "violet,pink", exitCount: 4 },
  { code: "JNP", name: "Nehru Place", city: "Delhi", lines: "Violet,Magenta", lineColors: "violet,magenta", exitCount: 3 },
  { code: "JPURI", name: "Janakpuri West", city: "Delhi", lines: "Blue,Magenta", lineColors: "blue,magenta", exitCount: 3 },

  // ── Mumbai (MMRCL + MMOPL) — 14 stations ──────────────────────
  { code: "AND", name: "Andheri", city: "Mumbai", lines: "Blue,Red", lineColors: "blue,red", exitCount: 4 },
  { code: "GKP", name: "Ghatkopar", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "VRD", name: "Versova", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "CSM", name: "CSMT", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 4 },
  { code: "BKC", name: "Bandra Kurla Complex", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 3 },
  { code: "WRD", name: "Worli", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 2 },
  { code: "JRQ", name: "Jogeshwari", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "DNR", name: "DN Nagar", city: "Mumbai", lines: "Yellow,Blue", lineColors: "yellow,blue", exitCount: 2 },
  { code: "DH", name: "Dahisar", city: "Mumbai", lines: "Yellow,Red", lineColors: "yellow,red", exitCount: 2 },
  { code: "BVL", name: "Borivali", city: "Mumbai", lines: "Red", lineColors: "red", exitCount: 2 },
  { code: "MAL", name: "Malad", city: "Mumbai", lines: "Red", lineColors: "red", exitCount: 2 },
  { code: "GRD", name: "Acharya Atre Nagar (Goregaon)", city: "Mumbai", lines: "Aqua,Red", lineColors: "aqua,red", exitCount: 2 },
  { code: "MCT", name: "Mumbai Central", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 2 },
  { code: "SVP", name: "Siddhivinayak", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 2 },

  // ── Bengaluru (BMRCL / Namma Metro) — 14 stations ─────────────
  { code: "CSB", name: "Cubbon Park", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "MGR", name: "MG Road", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 3 },
  { code: "BYH", name: "Baiyappanahalli", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 3 },
  { code: "IND", name: "Indiranagar", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "YSR", name: "Yeshwanthpur", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 3 },
  { code: "NRS", name: "Nagasandra", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "KRP", name: "Nadaprabhu Kempegowda (Majestic)", city: "Bengaluru", lines: "Purple,Green", lineColors: "purple,green", exitCount: 4 },
  { code: "HAL", name: "Halasuru", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "TRN", name: "Trinity", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "VS", name: "Dr. B.R. Ambedkar (Vidhana Soudha)", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "KRM", name: "KR Market", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "MSR", name: "Mantri Square Sampige Road", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "JNR", name: "Jayanagara", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "BSK", name: "Banashankari", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 2 },

  // ── Hyderabad (HMRL) — 12 stations ────────────────────────────
  { code: "AMR", name: "Ameerpet", city: "Hyderabad", lines: "Red,Blue", lineColors: "red,blue", exitCount: 4 },
  { code: "HCS", name: "Hitech City", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "LKP", name: "Lakdi-ka-Pul", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },
  { code: "NGP", name: "Nagole", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "MYP", name: "Miyapur", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },
  { code: "SEC", name: "Secunderabad East", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "PRD", name: "Parade Ground", city: "Hyderabad", lines: "Blue,Red", lineColors: "blue,red", exitCount: 2 },
  { code: "JHS", name: "Jubilee Hills Check Post", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "MHP", name: "Madhapur", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "KKB", name: "Kukatpally", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },
  { code: "PGT", name: "Punjagutta", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },
  { code: "KHT", name: "Khairatabad", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },

  // ── Chennai (CMRL) — 12 stations ──────────────────────────────
  { code: "CEN", name: "Chennai Central", city: "Chennai", lines: "Blue,Green", lineColors: "blue,green", exitCount: 3 },
  { code: "ANP", name: "Anna Nagar", city: "Chennai", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "AIR", name: "Chennai Airport", city: "Chennai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "TBM", name: "Tambaram", city: "Chennai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "ALN", name: "Alandur", city: "Chennai", lines: "Blue,Green", lineColors: "blue,green", exitCount: 2 },
  { code: "STM", name: "St. Thomas Mount", city: "Chennai", lines: "Blue,Green", lineColors: "blue,green", exitCount: 2 },
  { code: "VDP", name: "Vadapalani", city: "Chennai", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "ASK", name: "Ashok Nagar", city: "Chennai", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "KYB", name: "Koyambedu", city: "Chennai", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "CMBT", name: "CMBT (Koyambedu bus terminus)", city: "Chennai", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "EKN", name: "Ekkatuthangal", city: "Chennai", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "GUJ", name: "Guindy", city: "Chennai", lines: "Blue", lineColors: "blue", exitCount: 2 },

  // ── Kolkata (Metro Railway) — 12 stations ─────────────────────
  { code: "DMD", name: "Dum Dum", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "SCG", name: "Shyambazar", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "PCD", name: "Park Street", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "HWD", name: "Howrah Maidan", city: "Kolkata", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "SLL", name: "Salt Lake Sector V", city: "Kolkata", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "EFP", name: "Esplanade", city: "Kolkata", lines: "Blue,Green,Orange", lineColors: "blue,green,orange", exitCount: 4 },
  { code: "DKS", name: "Dakshineswar", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "GP", name: "Girish Park", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "CTL", name: "Central", city: "Kolkata", lines: "Blue,Green", lineColors: "blue,green", exitCount: 2 },
  { code: "RSN", name: "Rabindra Sadan", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "KLB", name: "Kalighat", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "KVS", name: "Kavi Subhash", city: "Kolkata", lines: "Blue,Orange", lineColors: "blue,orange", exitCount: 2 },
];

export const STATIONS: StationSeed[] = RAW_STATIONS.map((s) => ({ ...s, id: `st-${s.code}` }));

export const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"] as const;

// Line colour → hex mapping used by UI badges.
export const LINE_COLOR_HEX: Record<string, string> = {
  blue: "#2563eb",
  yellow: "#eab308",
  red: "#dc2626",
  violet: "#7c3aed",
  green: "#16a34a",
  orange: "#ea580c",
  magenta: "#c026d3",
  purple: "#9333ea",
  aqua: "#0891b2",
  pink: "#db2777",
  grey: "#6b7280",
};
