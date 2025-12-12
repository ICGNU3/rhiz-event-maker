import { db } from "@/lib/db";
import { events, speakers, sessions, tickets } from "@/lib/db/schema";
import { EventAppConfig } from "@/lib/types";
import { eq } from "drizzle-orm";

export async function createEventInDb(
  eventId: string,
  config: EventAppConfig,
  eventType: string,
  ownerId: string
) {
  try {
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      await db.transaction(async (tx) => {
        // 1. Insert Main Event
        await tx.insert(events).values({
            slug: eventId,
            name: config.content?.eventName || "Untitled Event",
            config: config as unknown as object, 
            type: eventType,
            ownerId: ownerId,
            status: "draft",
            updatedAt: new Date(),
        });

        // 2. Insert Relational Data (Normalization)
        
        // Speakers
        if (config.content?.speakers?.length) {
            await tx.insert(speakers).values(
                config.content.speakers.map(s => ({
                    id: crypto.randomUUID(),
                    eventId: eventId, // slug as FK for now per schema
                    name: s.name,
                    role: s.role,
                    company: s.company,
                    bio: s.bio,
                    imageUrl: s.imageUrl,
                    handle: s.handle
                }))
            );
        }

        // Sessions
        if (config.content?.schedule?.length) {
             await tx.insert(sessions).values(
                config.content.schedule.map(s => ({
                    id: crypto.randomUUID(),
                    eventId: eventId,
                    title: s.title,
                    description: s.description,
                    startTime: s.startTime ? new Date(s.startTime) : null,
                    endTime: s.endTime ? new Date(s.endTime) : null,
                    location: s.location
                }))
             );
        }

        // Tickets
        if (config.ticketing?.tiers?.length) {
            await tx.insert(tickets).values(
                config.ticketing.tiers.map(t => ({
                    id: t.id || crypto.randomUUID(),
                    eventId: eventId,
                    name: t.name,
                    price: t.price,
                    currency: t.currency,
                    description: t.description,
                    capacity: t.capacity,
                    paymentUrl: t.paymentUrl,
                    features: t.features
                }))
            );
        }
      });

      console.log("DB: Saved event and relations", eventId);
      return true;
    }
  } catch (dbError) {
    console.error("DB: Failed to save event", dbError);
    throw dbError;
  }
}

export async function getEventBySlug(slug: string) {
  try {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    if (!result || result.length === 0) {
      return null;
    }

    // Cast config to correct type
    return {
      ...result[0],
      config: result[0].config as EventAppConfig,
    };
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return null;
  }
}

export async function updateEventInDb(
  eventId: string,
  newConfig: EventAppConfig,
  ownerId: string
) {
  const { and } = await import("drizzle-orm");
  
  await db.transaction(async (tx) => {
      // 1. Update Core Event
      const result = await tx
        .update(events)
        .set({
          config: newConfig as unknown as object,
          updatedAt: new Date(),
          name: newConfig.content?.eventName,
        })
        .where(
            and(
                eq(events.slug, eventId),
                eq(events.ownerId, ownerId)
            )
        )
        .returning({ updatedId: events.slug });
        
      if (result.length === 0) {
          throw new Error("Update failed: Event not found or unauthorized");
      }

      // 2. Sync Relational Tables (Full Replace Strategy for Simplicity)
      // Delete existing relations for this event
      await tx.delete(speakers).where(eq(speakers.eventId, eventId));
      await tx.delete(sessions).where(eq(sessions.eventId, eventId));
      await tx.delete(tickets).where(eq(tickets.eventId, eventId));

      // Re-insert
      if (newConfig.content?.speakers?.length) {
        await tx.insert(speakers).values(
            newConfig.content.speakers.map(s => ({
                id: crypto.randomUUID(),
                eventId: eventId,
                name: s.name,
                role: s.role,
                company: s.company,
                bio: s.bio,
                imageUrl: s.imageUrl,
                handle: s.handle
            }))
        );
    }

    if (newConfig.content?.schedule?.length) {
         await tx.insert(sessions).values(
            newConfig.content.schedule.map(s => ({
                id: crypto.randomUUID(),
                eventId: eventId,
                title: s.title,
                description: s.description,
                startTime: s.startTime ? new Date(s.startTime) : null,
                endTime: s.endTime ? new Date(s.endTime) : null,
                location: s.location
            }))
         );
    }

    if (newConfig.ticketing?.tiers?.length) {
        await tx.insert(tickets).values(
            newConfig.ticketing.tiers.map(t => ({
                id: t.id || crypto.randomUUID(),
                eventId: eventId,
                name: t.name,
                price: t.price,
                currency: t.currency,
                description: t.description,
                capacity: t.capacity,
                paymentUrl: t.paymentUrl,
                features: t.features
            }))
        );
    }
  });
}
