import { RhizClient, PeopleClient } from "@rhiz/protocol-sdk";

/**
 * Rhiz Protocol Integration for Event Architect
 * 
 * This module provides a configured Rhiz client for tracking
 * event attendee relationships and interactions.
 */

// Initialize Rhiz client
export const rhizClient = new RhizClient({
  baseUrl: process.env.RHIZ_API_URL || "http://localhost:8000",
  getAccessToken: async () => {
    // TODO: Integrate with your auth system (Clerk, Supabase, etc.)
    // For now, return null (public endpoints only)
    return null;
  },
});

// Initialize People client for managing attendees
export const peopleClient = new PeopleClient({
  baseUrl: process.env.RHIZ_API_URL || "http://localhost:8000",
  getAccessToken: async () => {
    return null;
  },
});

/**
 * Log a networking interaction at an event
 * 
 * @example
 * await logEventInteraction({
 *   eventId: "event-123",
 *   eventName: "Tech Conference 2025",
 *   attendee1Id: "person-abc",
 *   attendee2Id: "person-def",
 *   ownerId: "organizer-xyz",
 *   context: "booth_visit"
 * });
 */
export async function logEventInteraction({
  eventId,
  eventName,
  attendee1Id,
  attendee2Id,
  ownerId,
  context = "networking",
  notes,
}: {
  eventId: string;
  eventName: string;
  attendee1Id: string;
  attendee2Id: string;
  ownerId: string;
  context?: string;
  notes?: string;
}) {
  try {
    const result = await rhizClient.logInteraction({
      owner_id: ownerId,
      actor_person_id: attendee1Id,
      partner_person_id: attendee2Id,
      timestamp: new Date().toISOString(),
      summary: notes || `Met at ${eventName}`,
      context_tags: ["event", context, eventId],
      outcome_tag: "connection_made",
    });

    console.log(`✅ Logged interaction at ${eventName}`);
    console.log(`   Trust delta: ${result.trust_event.trust_delta}`);
    console.log(`   New trust score: ${result.trust_event.new_trust_score}`);

    return result;
  } catch (error) {
    console.error("Failed to log event interaction:", error);
    throw error;
  }
}

/**
 * Get warm introduction path between two attendees
 * 
 * Useful for suggesting introductions at events
 */
export async function findIntroductionPath(
  fromPersonId: string,
  toPersonId: string,
  _maxHops: number = 3 // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  // TODO: Implement when HealthClient is available
  // This will use the warm path finding from the SDK
  console.log(`Finding path from ${fromPersonId} to ${toPersonId}`);
}

/**
 * Get recommended connections for an attendee
 * 
 * Based on their existing network and event context
 */
export async function getRecommendedConnections(
  personId: string,
  ownerId: string,
  _eventContext?: string // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  try {
    const relationships = await rhizClient.listRelationships({
      owner_id: ownerId,
      person_id: personId,
      min_strength: 0.3,
      limit: 10,
    });

    return relationships.relationships;
  } catch (error) {
    console.error("Failed to get recommended connections:", error);
    return [];
  }
}

/**
 * Sync event attendee to Rhiz Protocol
 * 
 * Creates or updates a person record for an event attendee
 */
export async function syncAttendee({
  ownerId,
  attendee,
}: {
  ownerId: string;
  attendee: {
    email: string;
    name: string;
    company?: string;
    role?: string;
  };
}) {
  try {
    const person = await peopleClient.createPerson({
      owner_id: ownerId,
      preferred_name: attendee.name,
      emails: [attendee.email],
      primary_role: attendee.role,
      tags: attendee.company ? [attendee.company] : [],
    });

    console.log(`✅ Synced attendee: ${attendee.name}`);
    return person;
  } catch {
    // Person might already exist
    console.log(`ℹ️  Attendee may already exist: ${attendee.name}`);
    return null;
  }
}
