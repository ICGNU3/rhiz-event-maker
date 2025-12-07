import { RhizClient, InteractionCreate } from "./protocol-sdk";
import { Attendee, ConnectionSuggestion, Session } from "./types";

// Initialize the Rhiz Protocol Client
// In a real app, you'd get the token from your auth provider
export const client = new RhizClient({
  baseUrl: process.env.NEXT_PUBLIC_RHIZ_API_URL || "http://localhost:8000",
  getAccessToken: async () => {
    // TODO: Implement actual token retrieval
    return process.env.RHIZ_API_TOKEN || null;
  },
});

export const rhizClient = {
  ensureIdentity: async (args: {
    externalUserId?: string;
    email?: string;
    name?: string;
  }): Promise<{ id: string; externalUserId?: string }> => {
    // In a real implementation, this would call the People API
    // For now, we'll keep the mock ID generation but wrap it for future SDK usage
    console.log("Rhiz: ensureIdentity", args);
    return {
      id: "rhiz_id_" + Math.random().toString(36).substring(7),
      externalUserId: args.externalUserId,
    };
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

  getSuggestedConnections: async (args: {
    eventId: string;
    identityId: string;
    limit?: number;
  }): Promise<ConnectionSuggestion[]> => {
    try {
      // Use the SDK to get relationship suggestions
      // detailed implementation would depend on specific SDK methods for suggestions
      const response = await client.listRelationships({
        owner_id: args.eventId,
        source_person_id: args.identityId,
        limit: args.limit || 5,
        sort_by: "strength_score",
        sort_order: "desc"
      });
      
      // Map response to ConnectionSuggestion
      return response.relationships.map(rel => ({
        targetAttendeeId: rel.target_person_id,
        score: rel.strength_score,
        reasonSummary: "High interaction strength", // Placeholder
        sharedTags: [], // Placeholder
        sharedIntents: [], // Placeholder
        talkingPoints: [] // Placeholder
      }));
    } catch (error) {
       console.warn("Failed to get suggestions from Rhiz Protocol:", error);
       return [];
    }
  },

  ingestAttendees: async (args: {
    eventId: string;
    attendees: Attendee[];
  }): Promise<void> => {
    console.log("Rhiz: ingestAttendees", args);
    // TODO: Use Bulk People API when available in SDK
  },

  ingestSessions: async (args: {
    eventId: string;
    sessions: Session[];
  }): Promise<void> => {
    console.log("Rhiz: ingestSessions", args);
    // TODO: Map sessions to Context Tags or Goals
  },
};
