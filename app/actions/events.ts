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

  // 2. Input Extraction & Validation
  const eventBasics = (formData.get("eventBasics") as string) || "";
  const eventDate = (formData.get("eventDate") as string) || "";
  const eventLocation = (formData.get("eventLocation") as string) || "";
  const goalsStr = (formData.get("goals") as string) || "";
  const goals = goalsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const audience = (formData.get("audience") as string) || "General Audience";
  const relationshipIntent = (formData.get("relationshipIntent") as string) || "medium";
  const tone = (formData.get("tone") as string) || "professional";
  const rawType = formData.get("type") as string;
  const eventType = rawType === "lite" || rawType === "architect" ? rawType : "architect";
  const explicitEventName = (formData.get("eventName") as string) || "";

  if (eventType === "architect" && (!eventBasics || eventBasics.length < 10)) {
    return { success: false, error: "Please describe your event in more detail (10+ chars)" };
  }
  if (eventType === "lite" && !explicitEventName) {
    return { success: false, error: "Event Name is required" };
  }
  if (!eventDate) return { success: false, error: "Event date is required" };
  if (!eventLocation) return { success: false, error: "Event location is required" };
  if (goals.length === 0) return { success: false, error: "At least one goal is required" };

  try {
    // 3. AI Generation
    const inputs: EventGenerationInputs = {
      eventBasics,
      explicitEventName,
      eventDate,
      eventLocation,
      goals,
      audience,
      relationshipIntent,
      tone
    };

    console.log("Generating config for logic:", eventType);
    const { config, eventId } = await generateEventConfigFromInputs(inputs);
    
    // 4. Persistence
    await createEventInDb(eventId, config, eventType, userId);

    // 5. Protocol Sync
    // We run this non-blocking or blocking? Previously distinct try-catch blocks.
    // We'll run it and log errors internally in the service, or here.
    // The service I wrote catches errors but log them.
    await syncEventToProtocol(eventId, config);

    return { success: true, data: { ...config, eventId } };

  } catch (error: unknown) {
    console.error("Server Action Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
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

    const current = await getEventBySlug(eventId);
    if (!current) {
        throw new Error("Event not found");
    }

    if (current.ownerId !== userId) {
       return { success: false, error: "Forbidden" };
    }

    // Merge logic
    const newConfig = {
        ...current.config,
        ...updates,
        content: {
            ...current.config.content,
            ...updates.content,
        },
        branding: {
            ...current.config.branding,
            ...updates.branding,
        },
        updatedAt: new Date()
    };

    await updateEventInDb(eventId, newConfig);

    return { success: true, data: newConfig };
  } catch (error) {
      console.error("Update failed:", error);
      return { success: false, error: String(error) };
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
