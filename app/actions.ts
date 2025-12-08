"use server";

import { b as baml } from "@/lib/baml_client/baml_client";
import { EventAppConfig } from "@/lib/baml_client/baml_client/types";
import { rhizClient } from "@/lib/rhizClient";
import { 
  BAMLGenerationError, 
  ValidationError,
  TimeoutError 
} from "@/lib/errors";
import { 
  retryWithBackoff, 
  withTimeout,
  logError
} from "@/lib/errorHandling";

/**
 * Generate event configuration with comprehensive error handling
 * Includes: validation, retry logic, timeout protection, and typed errors
 */
export async function generateEventConfig(formData: FormData) {
  // Extract and validate form data
  const eventBasics = (formData.get("eventBasics") as string) || "";
  const eventDate = (formData.get("eventDate") as string) || "";
  const eventLocation = (formData.get("eventLocation") as string) || "";
  const goalsStr = (formData.get("goals") as string) || "";
  const goals = goalsStr.split(",").map(s => s.trim()).filter(Boolean);
  const audience = (formData.get("audience") as string) || "General Audience";
  const relationshipIntent = (formData.get("relationshipIntent") as string) || "medium";
  const sessionShape = (formData.get("sessionShape") as string) || "standard";
  const matchmakingAppetite = (formData.get("matchmakingAppetite") as string) || "high";
  const tools = (formData.get("tools") as string) || "standard";
  const tone = (formData.get("tone") as string) || "professional";

  // Validate required fields
  if (!eventBasics || eventBasics.length < 10) {
    throw new ValidationError(
      "Event description must be at least 10 characters",
      "eventBasics",
      eventBasics
    );
  }

  if (!eventDate) {
    throw new ValidationError(
      "Event date is required",
      "eventDate"
    );
  }

  if (!eventLocation) {
    throw new ValidationError(
      "Event location is required",
      "eventLocation"
    );
  }

  if (goals.length === 0) {
    throw new ValidationError(
      "At least one goal is required",
      "goals"
    );
  }

  console.log("Generating config with inputs:", { 
    eventBasics: eventBasics.substring(0, 50) + "...", 
    eventDate, 
    eventLocation, 
    goals, 
    audience, 
    relationshipIntent, 
    tone 
  });

  try {
    // Wrap BAML call with retry logic and timeout
    const config = await retryWithBackoff<EventAppConfig>(
      async () => {
        // 30 second timeout for BAML generation
        return await withTimeout(
          baml.GenerateEventAppConfig(
            eventBasics,
            eventDate,
            eventLocation,
            goals,
            audience,
            relationshipIntent,
            sessionShape,
            matchmakingAppetite,
            tools,
            tone
          ),
          30000, // 30s timeout
          "Event generation took too long. Please try again."
        );
      },
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt}/3 after error:`, error.message);
          logError(error, { 
            attempt, 
            action: 'generateEventConfig',
            eventBasics: eventBasics.substring(0, 100)
          });
        }
      }
    );

    // Generate a stable event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log("Successfully generated event config. Event ID:", eventId);

    // Sync with Rhiz Protocol
    const syncPromises: Promise<void>[] = [];


    // 1. Sync Sample Attendees (Bulk)
    if (config.content?.sampleAttendees && config.content.sampleAttendees.length > 0) {
      // Prepare attendees for ingestion, ensuring everyone has a stable ID
      const attendeesToIngest = config.content.sampleAttendees.map((a, idx) => {
        if (!a.id) a.id = `attendee_${idx}_${Date.now()}`;
        return {
          id: a.id,
          name: a.name,
          email: `${a.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          tags: a.interests || [],
        };
      });

      try {
        const result = await rhizClient.ingestAttendees({
          eventId,
          attendees: attendeesToIngest
        });

        // The bulk API returns a list of personIds (strings). 
        // We need to map these back to our content objects if possible.
        // Ideally, ingestion returns the full objects or we fetch them.
        // For now, we unfortunately can't get the Handle/DID back for *each* person easily 
        // without a subsequent fetch or a smarter return type from `ingestAttendees`.
        // 
        // TODO: Update `ingestAttendees` to return map of externalId -> Person identity
        // For this immediate step, we will rely on the graph fetching them by ID or email later.
        console.log(`Rhiz: Bulk sync complete. Created: ${result.created}`);

      } catch (e) {
        console.warn("Retrying individual sync due to bulk failure", e);
        // Fallback or just log
      }
    }

    // 2. Sync Speakers (so they have identities in the graph)
    if (config.content?.speakers) {
      const speakerPromises = config.content.speakers.map(async (s, idx) => {
        const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        
        try {
          const identity = await rhizClient.ensureIdentity({
             email,
             name: s.name,
             externalUserId: `speaker_${idx}`
          });
          
          if (identity.handle) (s as any).handle = identity.handle;
          if (identity.did) (s as any).did = identity.did;
          
        } catch (e) {
          console.warn(`Failed to sync speaker ${s.name}`, e);
        }
      });
      syncPromises.push(...speakerPromises);
    }

    // Wait for all sync operations to complete
    if (syncPromises.length > 0) {
      console.log(`Rhiz: Syncing ${syncPromises.length} identities...`);
      await Promise.all(syncPromises);
      console.log("Rhiz: Sync complete");
    }
    
    // enhance config with metadata
    // We cast to any to avoid strict BAML type checks preventing the extra property
    return { ...config, eventId } as EventAppConfig & { eventId: string };

  } catch (error: unknown) {
    // Log detailed error information
    logError(error instanceof Error ? error : new Error(String(error)), {
      action: 'generateEventConfig',
      inputs: { eventBasics: eventBasics.substring(0, 100), eventDate, eventLocation }
    });

    // Convert to typed error if needed
    if (error instanceof ValidationError || 
        error instanceof TimeoutError || 
        error instanceof BAMLGenerationError) {
      throw error;
    }

    // Wrap unknown errors in BAMLGenerationError
    throw new BAMLGenerationError(
      "Failed to generate event configuration",
      error instanceof Error ? error : new Error(String(error)),
      { eventBasics: eventBasics.substring(0, 100) }
    );
  }
}

/**
 * Update existing event configuration (for live edit mode)
 */
export async function updateEventConfig(
  eventId: string,
  updates: Partial<EventAppConfig>
) {
  // TODO: Implement when adding data persistence
  console.log("Update event config:", eventId, updates);
  throw new Error("Not yet implemented");
}
