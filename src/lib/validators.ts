// Central Zod schemas — single source of truth for client + server validation.
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  city: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(280).optional().nullable(),
  homeStationId: z.string().optional().nullable(),
  workStationId: z.string().optional().nullable(),
  travelWindow: z.string().max(80).optional().nullable(),
  preferredLang: z.string().max(8).optional(),
  city: z.string().max(60).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const postSchema = z.object({
  body: z.string().min(1, "Post cannot be empty").max(1000),
  stationId: z.string().optional().nullable(),
  tag: z.enum(["general", "help", "info", "alert", "meetup"]).default("general"),
  imageUrl: z.string().url().optional().nullable(),
});
export type PostInput = z.infer<typeof postSchema>;

export const replySchema = z.object({
  body: z.string().min(1).max(1000),
});
export type ReplyInput = z.infer<typeof replySchema>;

export const carpoolSchema = z.object({
  type: z.enum(["offer", "request"]),
  originStationId: z.string().min(1),
  destinationArea: z.string().min(2).max(120),
  departAt: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
  seats: z.number().int().min(1).max(8),
  mode: z.enum(["auto", "cab", "personal"]),
  costSplit: z.enum(["share", "fixed", "free"]).default("share"),
  womenOnly: z.boolean().default(false),
  notes: z.string().max(500).optional().nullable(),
});
export type CarpoolInput = z.infer<typeof carpoolSchema>;

export const carpoolJoinSchema = z.object({
  message: z.string().max(280).optional().nullable(),
});

export const buddySchema = z.object({
  originStationId: z.string().min(1),
  destStationId: z.string().optional().nullable(),
  travelAt: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
  womenOnly: z.boolean().default(false),
  notes: z.string().max(500).optional().nullable(),
});
export type BuddyInput = z.infer<typeof buddySchema>;

export const lostFoundSchema = z.object({
  type: z.enum(["lost", "found"]),
  category: z.enum(["wallet", "phone", "keys", "bag", "id", "electronics", "other"]),
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(1000),
  stationId: z.string().min(1),
  eventDate: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
});
export type LostFoundInput = z.infer<typeof lostFoundSchema>;

export const marketplaceSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(1000),
  price: z.number().int().min(0).max(10000000),
  category: z.enum(["books", "electronics", "furniture", "household", "tickets", "other"]),
  condition: z.enum(["new", "good", "fair"]).default("good"),
  stationId: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
});
export type MarketplaceInput = z.infer<typeof marketplaceSchema>;

export const ratingSchema = z.object({
  ratedId: z.string().min(1),
  contextType: z.enum(["carpool", "buddy", "marketplace"]),
  contextId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  note: z.string().max(280).optional().nullable(),
});
export type RatingInput = z.infer<typeof ratingSchema>;

export const reportSchema = z.object({
  subjectId: z.string().min(1),
  targetType: z.enum(["post", "reply", "carpool", "buddy", "lost_found", "marketplace", "user"]),
  targetId: z.string().min(1),
  reason: z.string().min(2).max(500),
});
export type ReportInput = z.infer<typeof reportSchema>;

export const contactRequestSchema = z.object({
  recipientId: z.string().min(1),
  contextType: z.enum(["carpool", "lost_found", "marketplace", "buddy"]),
  contextId: z.string().min(1),
  message: z.string().max(280).optional().nullable(),
});
export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

// Standard API response helper.
export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export function ok<T>(data: T): ApiOk<T> {
  return { ok: true, data };
}
export function err(error: string): ApiErr {
  return { ok: false, error };
}

export function zodErrors(parsed: { success: false; error: any }): string {
  return parsed.error.issues.map((i: any) => `${i.path.join(".")}: ${i.message}`).join("; ");
}
