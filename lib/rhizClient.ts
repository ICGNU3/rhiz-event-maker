import { RhizClient, InteractionCreate, PeopleClient, PersonCreate, NlpClient } from "./protocol-sdk";
import { RelationshipDetail, OpportunityMatch } from "./protocol-sdk/types";
import { Session } from "./types";

// Initialize the Rhiz Protocol Client
const baseUrl = process.env.NEXT_PUBLIC_RHIZ_API_URL || "http://localhost:8000";
const getAccessToken = async () => process.env.RHIZ_API_TOKEN || null;
export const ownerId = process.env.RHIZ_OWNER_ID || "event-maker-app";

export const client = new RhizClient({
  baseUrl,
  getAccessToken,
});

// Initialize People Client for identity management
export const peopleClient = new PeopleClient({
  baseUrl,
  getAccessToken,
});

// Initialize NLP Client for intelligence
export const nlpClient = new NlpClient({
  baseUrl,
  getAccessToken,
});

export const rhizClient = {
  /**
   * Ensure a person exists in Rhiz Protocol
   * Creates a new person or returns existing one based on email
   */
  ensureIdentity: async (args: {
    externalUserId?: string;
    email?: string;
    name?: string;
  }): Promise<{ id: string; externalUserId?: string; did?: string; handle?: string }> => {
    try {
      // Try to find existing person by email if provided
      if (args.email) {
        try {
          const existingPeople = await peopleClient.listPeople({
            owner_id: ownerId,
            email: args.email,
            limit: 1,
          });
          
          if (existingPeople.people.length > 0) {
            const person = existingPeople.people[0];
            console.log("Rhiz: Found existing person", person.person_id);
            return {
              id: person.person_id,
              externalUserId: args.externalUserId,
              did: person.did,
              handle: person.handle,
            };
          }
        } catch (searchError) {
          // If search fails, continue to create new person
          console.warn("Rhiz: Failed to search for existing person", searchError);
        }
      }

      // Create new person
      const personData: PersonCreate = {
        owner_id: ownerId,
        legal_name: args.name || args.email || "Anonymous User",
        preferred_name: args.name,
        emails: args.email ? [args.email] : [],
      };

      const person = await peopleClient.createPerson(personData);
      console.log("Rhiz: Created new person", person.person_id);
      
      return {
        id: person.person_id,
        externalUserId: args.externalUserId,
        did: person.did,
        handle: person.handle,
      };
    } catch (error) {
      console.warn("Rhiz: Failed to ensure identity, using fallback", error);
      // Fallback to local ID if API is unavailable
      return {
        id: "local_" + Math.random().toString(36).substring(7),
        externalUserId: args.externalUserId,
      };
    }
  },

  recordInteraction: async (args: {
    eventId: string;
    fromIdentityId: string;
    toIdentityId?: string;
    type: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> => {
    try {
      const payload: InteractionCreate = {
        owner_id: args.eventId, // Using eventId as owner for context
        actor_person_id: args.fromIdentityId,
        partner_person_id: args.toIdentityId,
        timestamp: new Date().toISOString(),
        summary: `Interaction type: ${args.type}`,
        context_tags: ["event_interaction", args.type],
        // outcome_tag: args.metadata?.outcome as string,
      };

      await client.logInteraction(payload);
    } catch (error) {
      console.warn("Failed to log interaction to Rhiz Protocol:", error);
      // Don't throw, just log warning so app doesn't crash
    }
  },

  /**
   * Get suggested connections with rich relationship data
   * Returns people with strongest relationships first
   */
  getSuggestedConnections: async (args: {
    eventId: string;
    identityId: string;
    limit?: number;
  }): Promise<RelationshipDetail[]> => {
    try {
      // Get relationships sorted by strength
      const response = await client.listRelationships({
        owner_id: ownerId,
        source_person_id: args.identityId,
        limit: args.limit || 10,
        sort_by: "strength_score",
        sort_order: "desc",
        min_strength: 0.2, // Only show meaningful relationships
      });
      
      // Return the relationships directly as Protocol Types
      // We perform a cast here because the SDK currently returns RelationshipRead[] 
      // but in a real scenario we'd query the detail endpoint or enrich it.
      // For now, we'll map what we have to RelationshipDetail structure
      
      return response.relationships.map(rel => ({
        ...rel,
        interaction_count: rel.frequency_score * 10, // Mock derivation
        latest_interaction_at: rel.last_interaction_at
      } as RelationshipDetail));
    } catch (error) {
      console.warn("Rhiz: Failed to get connection suggestions", error);
      return []; // Graceful degradation
    }
  },

  /**
   * Get potential matches (opportunities) for people you haven't met yet.
   * Uses NlpClient.suggestIntroduction under the hood.
   */
  getOpportunityMatches: async (args: {
    eventId: string;
    identityId: string;
    limit?: number;
  }): Promise<OpportunityMatch[]> => {
    try {
      // Delegate to the Protocol's NLP Engine
      return await nlpClient.findOpportunityMatches({
        personId: args.identityId,
        limit: args.limit
      });
    } catch (error) {
      console.warn("Rhiz: Failed to get opportunity matches", error);
      return [];
    }
  },

  /**
   * Bulk ingest attendees into Rhiz Protocol
   * Creates people records for all attendees
   */
  ingestAttendees: async (args: {
    eventId: string;
    attendees: { name: string; email?: string; tags?: string[] }[];
  }): Promise<{ created: number; failed: number; personIds: string[] }> => {
    try {
      console.log(`Rhiz: Ingesting ${args.attendees.length} attendees`);
      
      // Convert attendees to PersonCreate format
      const peopleData: PersonCreate[] = args.attendees.map(attendee => ({
        owner_id: ownerId,
        legal_name: attendee.name,
        preferred_name: attendee.name,
        emails: attendee.email ? [attendee.email] : [],
        tags: attendee.tags || [],
      }));

      // Use bulk create API
      const result = await peopleClient.bulkCreatePeople(peopleData);
      
      console.log(`Rhiz: Successfully created ${result.count} people`);
      if (result.errors && result.errors.length > 0) {
        console.warn(`Rhiz: ${result.errors.length} attendees failed to create`);
      }

      return {
        created: result.count,
        failed: result.skipped + result.errors.length,
        personIds: result.ids,
      };
    } catch (error) {
      console.warn("Rhiz: Failed to ingest attendees", error);
      return {
        created: 0,
        failed: args.attendees.length,
        personIds: [],
      };
    }
  },

  ingestSessions: async (args: {
    eventId: string;
    sessions: Session[];
  }): Promise<void> => {
    console.log("Rhiz: ingestSessions", args);
    // TODO: Map sessions to Context Tags or Goals
  },
};
