// MetroMitra database seed.
// Run with: npm run db:seed
// Idempotent: safe to run multiple times (upserts by code / email).
// Self-contained — station seed data is inlined here to avoid TS/ESM
// resolution issues when run under plain Node.

const { PrismaClient } = require("@prisma/client");
const crypto = require("node:crypto");

const db = new PrismaClient();

// scrypt-based password hash using Node built-ins (no bcrypt dependency).
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const STATIONS = [
  // Delhi / NCR
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
  // Mumbai
  { code: "AND", name: "Andheri", city: "Mumbai", lines: "Blue,Yellow", lineColors: "blue,yellow", exitCount: 4 },
  { code: "GKP", name: "Ghatkopar", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "VRD", name: "Versova", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "CSM", name: "CSMT (Churchgate area)", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 4 },
  { code: "BKC", name: "Bandra Kurla Complex", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 3 },
  { code: "WRD", name: "Worli", city: "Mumbai", lines: "Aqua", lineColors: "aqua", exitCount: 2 },
  { code: "JRQ", name: "Jogeshwari", city: "Mumbai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  // Bengaluru
  { code: "CSB", name: "Cubbon Park", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "MGR", name: "MG Road", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 3 },
  { code: "BYH", name: "Baiyappanahalli", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 3 },
  { code: "IND", name: "Indiranagar", city: "Bengaluru", lines: "Purple", lineColors: "purple", exitCount: 2 },
  { code: "YSR", name: "Yeshwanthpur", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 3 },
  { code: "NRS", name: "Nagasandra", city: "Bengaluru", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "KRP", name: "Kempegowda (Majestic)", city: "Bengaluru", lines: "Purple,Green", lineColors: "purple,green", exitCount: 4 },
  // Hyderabad
  { code: "AMR", name: "Ameerpet", city: "Hyderabad", lines: "Red,Blue", lineColors: "red,blue", exitCount: 4 },
  { code: "HCS", name: "Hitech City", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "LKP", name: "Lakdi-ka-Pul", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },
  { code: "NGP", name: "Nagole", city: "Hyderabad", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "MYP", name: "Miyapur", city: "Hyderabad", lines: "Red", lineColors: "red", exitCount: 2 },
  // Chennai
  { code: "CEN", name: "Chennai Central", city: "Chennai", lines: "Blue,Green", lineColors: "blue,green", exitCount: 3 },
  { code: "ANP", name: "Anna Nagar", city: "Chennai", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "AIR", name: "Chennai Airport", city: "Chennai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "TBM", name: "Tambaram", city: "Chennai", lines: "Blue", lineColors: "blue", exitCount: 2 },
  // Kolkata
  { code: "DMD", name: "Dumdum", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 3 },
  { code: "SCG", name: "Shyambazar", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "PCD", name: "Park Street", city: "Kolkata", lines: "Blue", lineColors: "blue", exitCount: 2 },
  { code: "HWD", name: "Howrah Maidan", city: "Kolkata", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "SLL", name: "Salt Lake Sector V", city: "Kolkata", lines: "Green", lineColors: "green", exitCount: 2 },
  { code: "EFP", name: "Esplanade", city: "Kolkata", lines: "Blue,Green,Orange", lineColors: "blue,green,orange", exitCount: 4 },
];

async function main() {
  console.log("Seeding stations...");
  for (const s of STATIONS) {
    await db.station.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        city: s.city,
        lines: s.lines,
        lineColors: s.lineColors,
        exitCount: s.exitCount ?? null,
      },
      create: {
        code: s.code,
        name: s.name,
        city: s.city,
        lines: s.lines,
        lineColors: s.lineColors,
        exitCount: s.exitCount ?? null,
      },
    });
  }
  const stationCount = await db.station.count();
  console.log(`Stations in DB: ${stationCount}`);

  console.log("Seeding demo users...");
  const demoUsers = [
    { email: "devika@metromitra.in", name: "Devika Rao", bio: "Software engineer on the Purple Line. Looking for last-mile auto shares from MG Road to Indiranagar after 7pm.", preferredLang: "en", city: "Bengaluru" },
    { email: "rohan@metromitra.in", name: "Rohan Mehta", bio: "New to Delhi. Yellow Line daily. Dwarka -> Rajiv Chowk.", preferredLang: "en", city: "Delhi" },
    { email: "anitha@metromitra.in", name: "Anitha Sharma", bio: "Consultant travelling to Mumbai monthly. Andheri regular.", preferredLang: "en", city: "Mumbai" },
  ];
  for (const u of demoUsers) {
    const existing = await db.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await db.user.create({
        data: {
          email: u.email,
          name: u.name,
          passwordHash: hashPassword("password123"),
          bio: u.bio,
          preferredLang: u.preferredLang,
          city: u.city,
          trustScore: 35,
          verifiedBadge: true,
        },
      });
    }
  }
  const userCount = await db.user.count();
  console.log(`Users in DB: ${userCount}`);
  console.log("Seed complete. Demo password for all demo accounts: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
