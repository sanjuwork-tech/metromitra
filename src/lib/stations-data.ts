// Static seed of major Indian metro stations across six cities.
// Codes follow a short, readable convention. Line colours map to the
// real metro line palette and are used semantically in the UI.

export type StationSeed = {
  code: string;
  name: string;
  city: string;
  lines: string;
  lineColors: string;
  exitCount?: number;
};

export const STATIONS: StationSeed[] = [
  // ── Delhi / NCR (DMRC + Rapid Metro) ──────────────────────────
  { code: "RJC", name: "Rajiv Chowk", city: "Delhi", lines: "Blue,Yellow", lineColors: "blue,yellow", exitCount: 8 },
  { code: "CSK", name: "Connaught Place", city: "Delhi", lines: "Yellow", lineColors: "yellow", exitCount: 4 },
  { code: "NDLS", name: "New Delhi", city: "Delhi", lines: "Yellow,Orange", lineColors: "yellow,orange", exitCount: 4 },
  { code: "KASH", name: "Kashmere Gate", city: "Delhi", lines: "Red,Yellow,Violet", lineColors: "red,yellow,violet", exitCount: 6 },
  { code: "DWRK", name: "Dwarka Sector 8", city: "Delhi", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "SCT", name: "Saket", city: "Delhi", lines: "Yellow", lineColors: "yellow", exitCount: 2 },
  { code: "HND", name: "Hauz Khas", city: "Delhi", lines: "Yellow,Magenta", lineColors: "yellow,magenta", exitCount: 3 },
  { code: "GNR", name: "Gurgaon (Gurugram)", city: "Delhi", lines: "Yellow", lineColors: "yellow", exitCount: 2 },
  { code: "NDA", name: "Noida City Centre", city: "Delhi", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "AIRP", name: "IGI Airport", city: "Delhi", lines: "Orange", lineColors: "orange", exitCount: 4 },

  // ── Mumbai (MMOPL + MMRC + Metro lines) ───────────────────────
  { code: "AND", name: "Andheri", city: "Mumbai", lines: "Blue,Yellow", lineColors: "blue,yellow", exitCount: 4 },
  { code: "GKP", name: "Ghatkopar", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "VRD", name: "Versova", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "CSM", name: "CSMT (Churchgate area)", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 4 },
  { code: "BKC", name: "Bandra Kurla Complex", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 3 },
  { code: "WRD", name: "Worli", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 2 },
  { code: "JRQ", name: "Jogeshwari", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 2 },

  // ── Bengaluru (BMRCL / Namma Metro) ───────────────────────────
  { code: "CSB", name: "Cubbon Park", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "MGR", name: "MG Road", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 3 },
  { code: "BYH", name: "Baiyappanahalli", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 3 },
  { code: "IND", name: "Indiranagar", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "YSR", name: "Yeshwanthpur", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 3 },
  { code: "NRS", name: "Nagasandra", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "KRP", name: "KRP Metro (Kempegowda)", city: "Bengaluru", lines: "Purple,Green", lineColors: "purple,green", exitCount: 4 },

  // ── Hyderabad (HMRL) ──────────────────────────────────────────
  { code: "AMR", name: "Ameerpet", city: "Hyderabad", lines: "Red,Blue", lineColors: "red,blue", exitCount: 4 },
  { code: "HCS", name: "Hitech City", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "LKO", name: "Lakdi-ka-Pul", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },
  { code: "NGP", name: "Nagole", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "MYP", name: "Miyapur", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },

  // ── Chennai (CMRL) ────────────────────────────────────────────
  { code: "CEN", name: "Chennai Central", city: "Chennai", lines: "Blue,Green", lineColors: "blue,green", exitCount: 3 },
  { code: "ANP", name: "Anna Nagar", city: "Chennai", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "AIR", name: "Chennai Airport", city: "Chennai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "TBM", name: "Tambaram", city: "Chennai", lines: "Blue", lineColors: "blue", exitCount: 2 },

  // ── Kolkata (Metro Railway) ───────────────────────────────────
  { code: "DMD", name: "Dumdum", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "SCG", name: "Shyambazar", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "PCD", name: "Park Street", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "HWD", name: "Howrah Maidan", city: "Kolkata", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "SLL", name: "Salt Lake Sector V", city: "Kolkata", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "EFP", name: "Esplanade", city: "Kolkata", lines: "Blue,Green,Orange", lineColors: "blue,green,orange", exitCount: 4 },
];

export const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"] as const;

// Line colour → Tailwind/role mapping used by UI badges.
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
};
