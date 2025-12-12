import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, index } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(), // URL friendly ID 
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  location: text("location"),
  
  // Status matching EventStatus type
  status: text("status").default("draft").notNull(), 
  
  // Stores the full AI-generated configuration
  config: jsonb("config").notNull(), 
  
  // Event Type
  type: text("type").default("architect").notNull(), // 'lite' | 'architect'

  // Access control
  ownerId: text("owner_id").notNull(), // Maps to Rhiz Person ID or Auth User ID
  isPublic: boolean("is_public").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const registrations = pgTable("registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  
  // Identity
  userId: text("user_id").notNull(), // Auth ID
  rhizProfileId: text("rhiz_profile_id"), // Linked Protocol Identity

  // Ticket details
  ticketTierId: text("ticket_tier_id"), 
  status: text("status").default("pending"), // pending, confirmed, cancelled
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELATIONAL TABLES (PHASE 2 NORMALIZATION)

export const speakers = pgTable("speakers", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.slug, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  company: text("company"),
  bio: text("bio"),
  imageUrl: text("image_url"),
  handle: text("handle"), // Social handle
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    eventIdIdx: index("speakers_event_id_idx").on(table.eventId),
}));

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.slug, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  durationMinutes: integer("duration_minutes"),
  speakerIds: text("speaker_ids").array(), // Array of IDs, could lead to join table later
  location: text("location"), // Room/Stage
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    eventIdIdx: index("sessions_event_id_idx").on(table.eventId),
}));

export const tickets = pgTable("tickets", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.slug, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  price: integer("price").notNull(), // In cents
  currency: text("currency").default("USD").notNull(),
  features: text("features").array(),
  description: text("description"),
  capacity: integer("capacity"),
  paymentUrl: text("payment_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    eventIdIdx: index("tickets_event_id_idx").on(table.eventId),
}));

// TYPES

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Speaker = typeof speakers.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
