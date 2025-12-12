"use server";

import { auth } from "@clerk/nextjs/server";
import { EventAppConfig } from "@/lib/types";
import { 
  generateEventConfigFromInputs, 
  analyzeEventImage, 
  EventGenerationInputs 
} from "@/lib/services/ai";
import { 
  createEventInDb, 
  updateEventInDb, 
  getEventBySlug 
} from "@/lib/services/events";
import { syncEventToProtocol } from "@/lib/services/sync";

export async function getEvent(slug: string) {
  return getEventBySlug(slug);
}

/**
 * Generate event configuration with comprehensive error handling
 * Orchestrates: Inputs -> AI -> DB -> Sync
 */
export async function generateEventConfig(
  formData: FormData
): Promise<{
  success: boolean;
  data?: EventAppConfig & { eventId: string };
  error?: string;
}> {
  // 1. Authorization
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized: You must be logged in to create events." };
  }

  // 1.5 Rate Limiting
  const { limiter } = await import("@/lib/rate-limit");
  const { ErrorCode } = await import("@/lib/errors/codes");
  
  // Rate limit based on user ID. Limit: 10 expensive generations per hour.
  const limitResult = await limiter.checkLimit(userId, 10);
  
  if (!limitResult.success) {
      const { AppError } = await import("@/lib/errors/codes");
      // Use our AppError system so UI shows specific message
      throw new AppError("Rate limit exceeded", ErrorCode.RATE_LIMIT_EXCEEDED, 429);
  }

  // 2. Input Extraction & Validation
  const { sanitizeText } = await import("@/lib/validation/sanitize");
  const { eventGenerationInputSchema, ticketTierSchema } = await import("@/lib/validation/schemas");

  const inputs = {
      eventBasics: sanitizeText(formData.get("eventBasics") as string),
      explicitEventName: sanitizeText(formData.get("eventName") as string),
      eventDate: sanitizeText(formData.get("eventDate") as string),
      eventLocation: sanitizeText(formData.get("eventLocation") as string),
      goals: (formData.get("goals") as string)?.split(",").map(s => sanitizeText(s.trim())).filter(Boolean) as string[] || [],
      audience: sanitizeText(formData.get("audience") as string),
      relationshipIntent: sanitizeText(formData.get("relationshipIntent") as string),
      tone: sanitizeText(formData.get("tone") as string),
      type: sanitizeText(formData.get("type") as string) || "architect"
  };

  // Asset handling: Client now takes care of upload and sends URL
  const logoUrl = sanitizeText(formData.get("logo") as string);
  const backgroundUrl = sanitizeText(formData.get("background") as string);
  
  // Validate basic inputs
  const validation = eventGenerationInputSchema.safeParse(inputs);
  if (!validation.success) {
      // Format validation errors
      const errorMsg = validation.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
      const { AppError, ErrorCode } = await import("@/lib/errors/codes");
      throw new AppError(errorMsg, ErrorCode.VALIDATION_ERROR, 400); 
  }

  try {
    // 3. AI Generation
    const aiInputs: EventGenerationInputs = {
      eventBasics: inputs.eventBasics || "",
      explicitEventName: inputs.explicitEventName || "",
      eventDate: inputs.eventDate,
      eventLocation: inputs.eventLocation,
      goals: inputs.goals,
      audience: inputs.audience || "General Audience",
      relationshipIntent: inputs.relationshipIntent || "medium",
      tone: inputs.tone || "professional",
      logoUrl,
      backgroundUrl
    };

    console.log("Generating config for logic:", inputs.type);
    const { config, eventId } = await generateEventConfigFromInputs(aiInputs);
    
    // Parse manual ticket tiers
    const manualTiers: import("@/lib/types").TicketTier[] = [];
    let i = 0;
    while (formData.has(`tiers[${i}][name]`)) {
        const tierRaw = {
            id: sanitizeText(formData.get(`tiers[${i}][id]`) as string) || crypto.randomUUID(),
            name: sanitizeText(formData.get(`tiers[${i}][name]`) as string),
            price: Number(formData.get(`tiers[${i}][price]`)) || 0,
            currency: "USD",
            features: [],
            capacity: 100,
            description: sanitizeText(formData.get(`tiers[${i}][description]`) as string),
            paymentUrl: sanitizeText(formData.get(`tiers[${i}][paymentUrl]`) as string),
        };
        
        // Validate tier
        const tierValidation = ticketTierSchema.safeParse(tierRaw);
        if (tierValidation.success) {
             manualTiers.push(tierValidation.data as import("@/lib/types").TicketTier);
        }
        i++;
    }

    // Merge manual tiers with AI tiers
    if (manualTiers.length > 0) {
        // Explicitly cast to ensure type safety with the EventAppConfig
        config.ticketing = {
            enabled: true,
            tiers: [
                ...(config.ticketing?.tiers || []),
                ...manualTiers
            ]
        };
    } else {
        // Ensure ticketing is properly initialized if undefined in BAML result
         if (!config.ticketing) {
             config.ticketing = { enabled: false, tiers: [] };
         } else if (!config.ticketing.tiers) {
             config.ticketing.tiers = [];
         }
    }

    // 4. Persistence
    await createEventInDb(eventId, config, inputs.type, userId);

    // 5. Protocol Sync
    await syncEventToProtocol(eventId, config);

    return { success: true, data: { ...config, eventId } };

  } catch (error: unknown) {
     const { handleError } = await import("@/lib/errors/handler");
     return handleError(error);
  }
}

/**
 * Update existing event configuration
 */
export async function updateEventConfig(
  eventId: string,
  updates: Partial<EventAppConfig>
) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const { eventUpdateSchema } = await import("@/lib/validation/schemas");
    const { sanitizeObject } = await import("@/lib/validation/sanitize");

    // Retrieve current event to verify ownership
    const current = await getEventBySlug(eventId);
    if (!current) {
        throw new Error("Event not found");
    }

    // STRICT OWNER CHECK
    if (current.ownerId !== userId) {
       console.error(`Auth Error: User ${userId} tried to update event ${eventId} owned by ${current.ownerId}`);
       return { success: false, error: "Forbidden: You do not own this event." };
    }

    // Sanitize and Validate Updates
    const sanitizedUpdates = sanitizeObject(updates);
    const validation = eventUpdateSchema.safeParse(sanitizedUpdates);
    
    // Note: Partial updates might fail full schema parsing if schema expects required fields.
    // However, eventUpdateSchema handles optionality for update context.
    if (!validation.success) {
         return { success: false, error: "Invalid updates: " + validation.error.issues.map(e => e.message).join(", ") };
    }
    const safeUpdates = validation.data;

    // Merge logic
    // We only merge 3 levels deep if needed, but for now strict replace of sub-objects or shallow merge
    const newConfig: EventAppConfig = {
        ...current.config,
        ...safeUpdates,
        content: {
            ...current.config.content,
            ...safeUpdates.content,
            // Ensure schedule items have eventId if they are being updated
            schedule: safeUpdates.content?.schedule?.map(s => ({
                ...s,
                eventId: eventId,
                id: s.id || crypto.randomUUID(), // Ensure ID exists
                startTime: new Date(s.startTime),
                endTime: new Date(s.endTime),
            })) || current.config.content?.schedule,
        },
        branding: {
            ...current.config.branding,
            ...safeUpdates.branding,
        },
        ticketing: (safeUpdates.ticketing || current.config.ticketing) ? {
             enabled: safeUpdates.ticketing?.enabled ?? current.config.ticketing?.enabled ?? false,
             tiers: safeUpdates.ticketing?.tiers ?? current.config.ticketing?.tiers ?? []
        } : undefined,
        updatedAt: new Date()
    };

    await updateEventInDb(eventId, newConfig, userId);

    return { success: true, data: newConfig };
  } catch (error) {
     const { handleError } = await import("@/lib/errors/handler");
     return handleError(error);
  }
}

/**
 * Extract event details from image (Proxy to AI service)
 */
export async function extractDetailsFromImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");
    if (file.size > 4 * 1024 * 1024) throw new Error("File size too large (max 4MB)");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    console.log("Analyzing image...");
    const result = await analyzeEventImage(base64Image, mimeType);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Image extraction failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze image" 
    };
  }
}
