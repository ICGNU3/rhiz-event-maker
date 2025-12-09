import { pgTable, text, timestamp, uuid, jsonb, boolean } from "drizzle-orm/pg-core";

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
