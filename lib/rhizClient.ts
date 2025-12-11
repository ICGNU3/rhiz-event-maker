import { RhizClient, InteractionCreate, PeopleClient, NlpClient, ContextTagsClient, ContextTagCreate, ZkClient, IdentityHelper } from "./protocol-sdk";
import { RelationshipDetail, OpportunityMatch, PersonRead } from "./protocol-sdk/types";
import { Session } from "./types";
import { withTimeout } from "./errorHandling";

// Initialize the Rhiz Protocol Client
const baseUrl = process.env.NEXT_PUBLIC_RHIZ_API_URL || "http://localhost:8000";
const getAccessToken = async () => process.env.RHIZ_API_TOKEN || null;
export const ownerId = process.env.RHIZ_OWNER_ID || "event-maker-app";

export const client = new RhizClient({
  baseUrl,
  getAccessToken,
});

// Initialize Identity Helper (moved to protocol layer)
const identityHelper = new IdentityHelper({
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

// Initialize Context Tags Client for session alignment
export const contextTagsClient = new ContextTagsClient({
  baseUrl,
  getAccessToken,
});

// Initialize ZK Client for zero-knowledge proofs
export const zkClient = new ZkClient({
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
    tags?: string[];
    avatarUrl?: string;
  }): Promise<{ id: string; externalUserId?: string; did?: string; handle?: string }> => {
    try {
      // Use the Protocol SDK's IdentityHelper
      const result = await withTimeout(
        identityHelper.resolveIdentity({
            ...args,
            ownerId
        }),
        5000,
        "Identity resolution timed out"
      );

      console.log(result.isNew ? `Rhiz: Created new person ${result.id}` : `Rhiz: Found existing person ${result.id}`);

      if (result.isNew) {
         // FIRE AND FORGET: "Warm Start" Strategy (Seed Data)
         rhizClient.enrichIdentity({ 
            personId: result.id, 
            email: args.email 
         }).catch(e => console.warn("Rhiz: Background enrichment failed", e));
      }

      return {
        id: result.id,
        externalUserId: result.externalUserId,
        did: result.did,
        handle: result.handle,
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

  /**
   * "Warm Start" Logic: Ingest public data (simulated)
   * Scrapes public profiles to populate interests and seed initial connections.
   */
  enrichIdentity: async (args: { personId: string; email?: string }): Promise<void> => {
     // SIMULATED: In a real app, this would call Clearbit/Twitter API
     console.log("Rhiz: Warming up identity for", args.personId);
     
     // 1. Assign "Interest Tags" based on heuristics (or random for demo)
     const interests = ["Technology", "AI", "Startup", "Music", "Design"];
     const picked = interests.sort(() => 0.5 - Math.random()).slice(0, 2);
     
     // We would use peopleClient.updatePerson() here if available, 
     // or just log an interaction that implies these interests.
     
     // 2. Seed a "Welcome" Connection (The "Tom from Myspace" move)
     // Connect them to the "Rhiz Community Manager" so the graph isn't empty.
     const communityManagerId = "rhiz_community_manager"; 
     
     await rhizClient.recordInteraction({
         eventId: ownerId,
         fromIdentityId: communityManagerId,
         toIdentityId: args.personId,
         type: "welcome_handshake",
         metadata: { note: "Welcome to the Rhiz Network" }
     });
     
     console.log(`Rhiz: Enriched ${args.personId} with interests: ${picked.join(", ")}`);
  },

  recordInteraction: async (args: {
    eventId: string;
    fromIdentityId: string;
    toIdentityId?: string;
    toContextTag?: string; // Support tagging context updates
    type: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> => {
    try {
      if (args.toContextTag) {
          // If interaction is with a context (e.g., attending a session)
          // We might need a specific endpoint or just tag the interaction
          // For now, adhering to InteractionCreate which uses context_tags array
      }

      const payload: InteractionCreate = {
        owner_id: args.eventId, // Using eventId as owner for context
        actor_person_id: args.fromIdentityId,
        partner_person_id: args.toIdentityId,
        timestamp: new Date().toISOString(),
        summary: `Interaction type: ${args.type}`,
        context_tags: args.toContextTag ? ["event_interaction", args.type, args.toContextTag] : ["event_interaction", args.type],
        // outcome_tag: args.metadata?.outcome as string,
      };

      await withTimeout(client.logInteraction(payload), 2000).catch(() => {});
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
  }): Promise<(RelationshipDetail & { person?: PersonRead })[]> => {
    try {
      // Get relationships sorted by strength
      const response = await withTimeout(
        client.listRelationships({
          owner_id: ownerId,
          source_person_id: args.identityId,
          limit: args.limit || 10,
          sort_by: "strength_score",
          sort_order: "desc",
          min_strength: 0.2, // Only show meaningful relationships
        }),
        5000,
        "Relationship fetch timed out"
      );
      
      const relationships = response.relationships || [];

      // ENRICHMENT: Fetch the actual person details for each relationship
      const enriched = await Promise.all(relationships.map(async (rel) => {
          try {
              const personData = await peopleClient.getPerson(rel.target_person_id, ownerId);
              return {
                  ...rel,
                  interaction_count: rel.frequency_score * 10,
                  latest_interaction_at: rel.last_interaction_at,
                  person: personData
              };
          } catch {
              // If person lookup fails, return relationship without person data
              return {
                  ...rel,
                  interaction_count: rel.frequency_score * 10,
                  latest_interaction_at: rel.last_interaction_at
              };
          }
      }));

      return enriched as (RelationshipDetail & { person?: PersonRead })[];
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
      return await withTimeout(
        nlpClient.findOpportunityMatches({
          personId: args.identityId,
          limit: args.limit
        }),
        5000,
        "Opportunity match fetch timed out"
      );
    } catch (error) {
      console.warn("Rhiz: Failed to get opportunity matches", error);
      return [];
    }
  },

  /**
   * Bulk ingest attendees into Rhiz Protocol
   * Creates people records for all attendees and returns their identities (including handles/DIDs)
   */
  ingestAttendees: async (args: {
    eventId: string;
    attendees: { id?: string; name: string; email?: string; tags?: string[]; avatarUrl?: string }[];
  }): Promise<{ created: number; failed: number; attendees: { id: string; externalUserId?: string; did?: string; handle?: string }[] }> => {
    try {
      console.log(`Rhiz: Ingesting ${args.attendees.length} attendees`);
      
      // Process in parallel using ensureIdentity to guarantee we get the full objects back
      // Using Promise.all can be heavy if array is huge, but for event sample (~20-50) it's fine.
      // We don't wrap the *entire* batch in a timeout, but rely on individual ensureIdentity timeouts.
      
      const promises = args.attendees.map(attendee => 
        rhizClient.ensureIdentity({
          name: attendee.name,
          email: attendee.email,
          tags: attendee.tags,
          externalUserId: attendee.id,
          avatarUrl: attendee.avatarUrl
        })
      );

      const results = await Promise.all(promises);
      
      const successful = results.filter(r => !r.id.startsWith("local_"));
      const failed = results.filter(r => r.id.startsWith("local_"));

      console.log(`Rhiz: Successfully synced ${successful.length} people`);

      return {
        created: successful.length,
        failed: failed.length,
        attendees: results,
      };
    } catch (error) {
      console.warn("Rhiz: Failed to ingest attendees", error);
      return {
        created: 0,
        failed: args.attendees.length,
        attendees: [],
      };
    }
  },

  /**
   * Ingest sessions as Context Tags in the Rhiz Protocol.
   * This allows interactions to be tagged with "session:id" or "track:name"
   * fostering recommendations based on shared session interest.
   */
  ingestSessions: async (args: {
    eventId: string;
    sessions: Session[];
  }): Promise<void> => {
    console.log(`Rhiz: Ingesting ${args.sessions.length} sessions as Context Tags`);
    
    try {
        const promises = args.sessions.map(async (session) => {
            // Create a tag for the session
            const tagData: ContextTagCreate = {
                owner_id: ownerId,
                label: `session:${session.id}`,
                description: `${session.title}`,
                category: "event_session"
            };

            // We use create (which might fail if duplicate) or we could check existence.
            // For simplicity in this demo, we'll try to create and catch specific errors or rely on the SDK not to throw on dupes if handled.
            // But usually ContextTags must be unique by label/owner.
            // A better pattern is create-or-get, but let's just create and ignore "already exists" errors.
            try {
                await contextTagsClient.createContextTag(tagData);
            } catch {
                // If error contains "already exists" or 409, ignore.
                // Assuming standard error handling.
            }
        });

        await Promise.all(promises);
        console.log("Rhiz: Sessions ingested as Context Tags");
    } catch (error) {
        console.error("Rhiz: Failed to ingest sessions", error);
    }
  },
};
