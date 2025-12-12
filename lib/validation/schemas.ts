import { z } from "zod";

export const eventGoalSchema = z.enum([
  "dealflow",
  "community_building",
  "education",
  "healing",
  "movement_building",
  "internal_offsite",
  "fundraising",
  "networking",
  "career_fair",
]);

export const eventTypeSchema = z.enum(["lite", "architect"]);
export const toneSchema = z.enum(["professional", "vibrant", "luxury", "playful"]);

// --- Shared Base Schemas ---

export const speakerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().max(100).optional().default(""),
  company: z.string().max(100).optional().default(""),
  bio: z.string().max(1000).optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
  handle: z.string().optional(),
});

export const sessionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().or(z.date()), // Accepts ISO string or Date
  endTime: z.string().or(z.date()),
  format: z.string().optional(),
  track: z.string().optional(),
  speakers: z.array(z.string()).optional(),
});

export const ticketTierSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1, "Ticket name is required"),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().default("USD"),
  features: z.array(z.string()).default([]),
  capacity: z.number().min(1).optional(),
  description: z.string().optional().default(""),
  paymentUrl: z.string().url().optional().or(z.literal("")),
});

// --- Input Validation Schemas ---

/**
 * Validation for the Event Creation Form (Architect & Lite modes)
 */
export const eventGenerationInputSchema = z.object({
  // Common Fields
  eventBasics: z.string().max(2000).optional(), // Description
  explicitEventName: z.string().max(200).optional(),
  eventDate: z.string().min(1, "Date is required"),
  eventLocation: z.string().min(1, "Location is required"),
  
  // Enums / Selects
  goals: z.array(z.string()).default([]), // Can't easily use enum if input is comma-sep string initially
  audience: z.string().max(500).optional(),
  relationshipIntent: z.string().optional(),
  tone: z.string().optional(),
  
  // Implicit Logic
  type: eventTypeSchema.default("architect"),
}).refine(data => {
  // If Architect Mode, must have description (eventBasics)
  if (data.type === "architect") {
    // Check if eventBasics is present
    return !!data.eventBasics && data.eventBasics.length > 0;
  }
  // If Lite Mode, must have Name
  if (data.type === "lite") {
    return !!data.explicitEventName && data.explicitEventName.length > 0;
  }
  return true;
}, {
  message: "Missing required fields for selected mode",
  path: ["eventBasics"], // associate error with main field
});


export const eventUpdateSchema = z.object({
  content: z.object({
    eventName: z.string().min(1).max(200).optional(),
    tagline: z.string().max(300).optional(),
    date: z.string().optional(),
    location: z.string().optional(),
    speakers: z.array(speakerSchema).optional(),
    schedule: z.array(sessionSchema).optional(),
  }).optional(),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    toneKeywords: z.array(z.string()).optional(),
  }).optional(),
  ticketing: z.object({
    enabled: z.boolean().optional(),
    tiers: z.array(ticketTierSchema).optional(),
  }).optional(),
});

// --- AI Action Schemas ---

export const generateCopySchema = z.object({
  eventId: z.string().uuid().optional(), // Optional for now as it might be draft
  type: z.enum(["intro", "bio", "email", "tagline"]),
  tone: z.string().optional(),
  subjectName: z.string().max(200).optional(),
});

export const solveScheduleSchema = z.object({
  eventId: z.string(),
  constraints: z.object({
    maxConcurrent: z.number().min(1).max(10),
    bufferMinutes: z.number().min(0).max(60),
  }),
});

export const rewriteContentSchema = z.object({
  text: z.string().min(1).max(5000),
  targetTone: z.enum(["professional", "playful", "urgent"]),
});

export const outreachSchema = z.object({
  recipientProfile: z.object({
    name: z.string().max(200),
    role: z.string().max(200),
    recentWork: z.string().max(500).optional(),
  }),
});
