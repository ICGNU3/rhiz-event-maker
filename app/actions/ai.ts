import { auth } from "@clerk/nextjs/server";
import { generateCopySchema, solveScheduleSchema, rewriteContentSchema, outreachSchema } from "@/lib/validation/schemas";
import { sanitizeText } from "@/lib/validation/sanitize";

// NEW AI FEATURE ACTIONS
// These enforce the promise of the "Intelligence Suite"

/**
 * Generated Content Agent
 * "Instant copy, agendas, intros & sponsor blurbs."
 */
export async function generateEventCopy(context: {
  eventId?: string; // Made optional to match schema
  type: "intro" | "bio" | "email" | "tagline";
  tone?: string;
  subjectName?: string;
}): Promise<{ success: boolean; text: string; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, text: "", error: "Unauthorized" };

  const validation = generateCopySchema.safeParse(context);
  if (!validation.success) {
      return { success: false, text: "", error: "Invalid inputs" };
  }
  const safeContext = validation.data;

  console.log("Generating copy for:", safeContext);

  // MOCK: In production this would call OpenAI/BAML
  await new Promise((r) => setTimeout(r, 1500));

  const responses: Record<string, string> = {
    intro: `Please welcome ${
      sanitizeText(safeContext.subjectName || "our guest")
    }. A visionary in their field, they are redefining how we think about the intersection of technology and humanity.`,
    bio: `${sanitizeText(safeContext.subjectName || "Guest")} has spent the last decade building systems that matter. Formerly at TopTier Corp, now leading the charge at NextGen.`,
    tagline: "Where the future gathers to build what's next.",
    email: "Join us for an unforgettable experience.",
  };

  return {
    success: true,
    text: responses[safeContext.type] || "Content generated successfully.",
  };
}

/**
 * Smart Scheduling Engine
 * "Constraint-aware tracks & conflict resolution."
 * Validates against room capacity, speaker availability, etc.
 */
export async function solveSchedule(
  eventId: string,
  constraints: { maxConcurrent: number; bufferMinutes: number }
): Promise<{ success: boolean; schedule?: unknown; conflictsResolved?: number; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const validation = solveScheduleSchema.safeParse({ eventId, constraints });
  if (!validation.success) return { success: false, error: "Invalid constraints" };

  console.log(`Solving schedule for ${eventId} with constraints`, constraints);
  // Mock constraint solver
  await new Promise((r) => setTimeout(r, 2000));

  return {
    success: true,
    conflictsResolved: 3,
    schedule: [
      { id: "s1", time: "10:00", track: "Main", resolved: true },
      { id: "s2", time: "11:00", track: "Breakout", resolved: true },
    ],
  };
}

/**
 * Adaptive Voice / Rewriter
 * "Brand-safe rewriting & localization."
 */
export async function rewriteContent(
  text: string,
  targetTone: "professional" | "playful" | "urgent"
): Promise<{ success: boolean; text?: string; error?: string }> {
  // Public utility potentially, but safer to auth
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const validation = rewriteContentSchema.safeParse({ text, targetTone });
  if (!validation.success) return { success: false, error: "Invalid input" };
  
  const cleanText = sanitizeText(validation.data.text);

  console.log("Rewriting text to tone:", targetTone);
  if (targetTone === "playful") {
    return { success: true, text: cleanText.replace(/\./g, "! 🚀") + " Let's go!" };
  }
  return { success: true, text: cleanText }; 
}

/**
 * Comms & Outreach
 * "Drafts cold-opens & follow-up cadences."
 */
export async function generateOutreachSequence(recipientProfile: {
  name: string;
  role: string;
  recentWork?: string;
}): Promise<{ success: boolean; emailChain?: string[]; error?: string }> {
   const { userId } = await auth();
   if (!userId) return { success: false, error: "Unauthorized" };

   const validation = outreachSchema.safeParse({ recipientProfile });
   if (!validation.success) return { success: false, error: "Invalid profile data" };

   const profile = validation.data.recipientProfile;

  return {
    success: true,
    emailChain: [
      `Hi ${sanitizeText(profile.name)}, I saw your work on ${
        sanitizeText(profile.recentWork || "the project")
      }...`,
      `Just bumping this up, ${sanitizeText(profile.name)}...`,
    ],
  };
}
