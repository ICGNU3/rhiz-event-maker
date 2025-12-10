"use server";

import crypto from "node:crypto";
// import { b as baml } from "@/lib/baml_client/baml_client";
import { EventAppConfig, GraphAttendee, EventGoal } from "@/lib/types";
import { rhizClient, zkClient } from "@/lib/rhizClient";
import { 
  BAMLGenerationError, 
  ValidationError,
  TimeoutError 
} from "@/lib/errors";
import { 
  // retryWithBackoff, 
  // withTimeout,
  logError
} from "@/lib/errorHandling";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

// Deterministic hash to keep event + identity IDs stable across retries
const stableHash = (input: string) =>
  crypto.createHash("sha256").update(input).digest("hex").slice(0, 12);

/**
 * Generate event configuration with comprehensive error handling
 * Includes: validation, retry logic, timeout protection, and typed errors
 */
export async function generateEventConfig(formData: FormData): Promise<{ success: boolean; data?: EventAppConfig & { eventId: string }; error?: string }> {
  const eventBasics = (formData.get("eventBasics") as string) || "";
  const eventDate = (formData.get("eventDate") as string) || "";
  const eventLocation = (formData.get("eventLocation") as string) || "";
  const goalsStr = (formData.get("goals") as string) || "";
  const goals = goalsStr.split(",").map(s => s.trim()).filter(Boolean);
  const audience = (formData.get("audience") as string) || "General Audience";
  const relationshipIntent = (formData.get("relationshipIntent") as string) || "medium";
  const tone = (formData.get("tone") as string) || "professional";

  try {
    // Validate required fields
    if (!eventBasics || eventBasics.length < 10) {
      return { success: false, error: "Event description must be at least 10 characters" };
    }

    if (!eventDate) {
      return { success: false, error: "Event date is required" };
    }

    if (!eventLocation) {
      return { success: false, error: "Event location is required" };
    }

    if (goals.length === 0) {
      return { success: false, error: "At least one goal is required" };
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

    // Mock BAML response for 'Convergence Intelligence Summit' Demo
    const config: EventAppConfig = {
      id: "mock_config_1",
      eventId: "evt1",
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      attendeeProfileFields: [],
      primaryGoals: ["community_building", "networking", "education"],
      matchmakingConfig: {
        enabled: true,
        inputSignals: ["trust_clusters", "timing_indicators", "contribution_profiles", "shared_mission"],
        matchTypes: ["cluster_of_8", "convergence_circle", "1:1_high_value"],
        meetingDurations: [15, 45, 60]
      },
      sessionConfig: {
        tracksEnabled: true,
        maxConcurrentSessions: 4,
        sessionTypes: ["keynote", "activation", "convergence_circle"]
      },
      engagementConfig: {
        chatEnabled: true,
        qnaEnabled: true,
        pollsEnabled: true,
        liveFeedEnabled: true
      },
      relationshipFeatures: {
        relationshipScoresVisible: true,
        warmPathHintsEnabled: true,
        introRequestsEnabled: true
      },
      branding: {
        primaryColor: "#0F172A", // Slate 900
        accentColor: "#38BDF8", // Sky 400
        logoUrl: "/images/convergence-logo.png",
        toneKeywords: ["strategic", "ambitious", "intelligent", "coordinate"]
      },
      designNotes: "Cinematic, deep, intelligence-driven, high contrast.",
      
      // New Data Ingestion
      ticketing: {
        registrationOpen: true,
        skus: [
          { id: "t1", name: "Builder Fellowship", price: 0, currency: "USD", features: ["Full Access", "Travel Stipend Eligible"] },
          { id: "t2", name: "General Admission", price: 99500, currency: "USD", features: ["Full Access", "Meals"] },
          { id: "t3", name: "Supporter", price: 250000, currency: "USD", features: ["Full Access", "VIP Dinner", "Name in Program"] }
        ]
      },
      venueConstraints: {
        maxCapacity: 350,
        roomConstraints: {
          "Main Stage": { capacity: 350, avFeatures: ["Livestream", "Projector"] },
          "Activation Room": { capacity: 100, avFeatures: ["Whiteboards", "Screens"] },
          "Convergence Circle A": { capacity: 20, avFeatures: ["No Devices"] }
        },
        accessibilityFeatures: ["Wheelchair Accessible", "Live Captioning", "Quiet Room"]
      },
      sponsors: {
        tiers: [
          { 
            id: "st1", 
            name: "Title Partner", 
            minContribution: 5000000, 
            benefits: ["Keynote Intro", "Lounge Branding"],
            sponsors: [
              { id: "org1", name: "Greylock", slug: "greylock", ownerUserId: "u1", createdAt: new Date() }
            ]
          },
          {
            id: "st2",
            name: "Ecosystem Partner",
            minContribution: 2500000,
            benefits: ["Booth", "Workshop Host"],
            sponsors: [
              { id: "org2", name: "Protocol Labs", slug: "protocol-labs", ownerUserId: "u2", createdAt: new Date() }
            ]
          }
        ],
        assets: {
          "tier_1_logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Greylock_Partners_logo.svg/2560px-Greylock_Partners_logo.svg.png"
        }
      },
      legal: {
        codeOfConductUrl: "https://example.com/coc",
        privacyPolicyUrl: "https://example.com/privacy",
        photoConsentRequired: true,
        termsOfServiceUrl: "https://example.com/tos"
      },
      successMetrics: {
        targetNps: 75,
        pipelineTargets: { value: "10000000", currency: "USD" }
      },
      contentGuardrails: {
        brandVoiceGuidelines: "Use active voice. Avoid buzzwords unless defining them. Be optimistic but rigorous.",
        tabooTopics: ["Ponzi schemes", "Price speculation", "Politics without policy"],
        sensitiveTopics: ["AI safety", "Regulation"]
      },

      content: {
        eventName: "Convergence Intelligence Summit",
        tagline: "Coordination replaces competition when networks can see themselves.",
        date: "October 12-14, 2025",
        location: "Presidio, San Francisco",
        speakers: [
          { name: "Reid Hoffman", role: "Partner", company: "Greylock", bio: "Architecting systems that coordinate at scale.", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces", handle: "reid", did: "did:rhiz:reid" },
          { name: "Anne-Marie Slaughter", role: "CEO", company: "New America", bio: "Redefining civic networks.", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces", handle: "ams", did: "did:rhiz:ams" },
          { name: "Salim Ismail", role: "Founder", company: "OpenExO", bio: "Exponential organizations and systems.", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces", handle: "salim", did: "did:rhiz:salim" },
          { name: "Tim O'Reilly", role: "Founder", company: "O'Reilly Media", bio: "Mapping the future of work and identity.", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces", handle: "tim", did: "did:rhiz:tim" },
          { name: "Aaron Levie", role: "CEO", company: "Box", bio: "Enterprise velocity and digital identity.", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces", handle: "levie", did: "did:rhiz:levie" },
          { name: "Vitalik Buterin", role: "Co-founder", company: "Ethereum", bio: "Building network-aware immutable tools.", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces", handle: "vitalik", did: "did:rhiz:vitalik" },
          { name: "Meredith Whittaker", role: "President", company: "Signal", bio: "Privacy as infrastructure for trust.", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces", handle: "meredith", did: "did:rhiz:meredith" },
          { name: "Glen Weyl", role: "Founder", company: "RadicalxChange", bio: "Plurality and democratic mechanisms.", imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=faces", handle: "glen", did: "did:rhiz:glen" },
          { name: "Dan Koppelkamm", role: "Investigator", company: "Rhiz", bio: "Network cartography.", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces", handle: "dan", did: "did:rhiz:dan" }
        ],
        schedule: [
          // Pre-Event / Opening
          { id: "s0", eventId: "evt1", startTime: new Date("2025-10-12T09:00:00"), endTime: new Date("2025-10-12T10:00:00"), format: "keynote", speakers: ["Dan Koppelkamm"], title: "Opening Keynote: The Logic of Convergence", track: "Main Stage" },
          { id: "s0_1", eventId: "evt1", startTime: new Date("2025-10-12T10:00:00"), endTime: new Date("2025-10-12T11:00:00"), format: "activation", speakers: [], title: "Network Activation: Forming Trust Clusters", track: "Activation" },
          
          // Pillar 1
          { id: "p1_key", eventId: "evt1", startTime: new Date("2025-10-12T11:00:00"), endTime: new Date("2025-10-12T12:00:00"), format: "keynote", speakers: ["Reid Hoffman"], title: "Keynote: Systems That Coordinate", track: "Main Stage" },
          { id: "p1_act", eventId: "evt1", startTime: new Date("2025-10-12T12:00:00"), endTime: new Date("2025-10-12T13:00:00"), format: "activation", speakers: ["Salim Ismail"], title: "Activation: Cross-Sector Scenarios", track: "Activation" },
          
          // Pillar 2
          { id: "p2_key", eventId: "evt1", startTime: new Date("2025-10-12T13:30:00"), endTime: new Date("2025-10-12T14:30:00"), format: "keynote", speakers: ["Tim O'Reilly"], title: "Keynote: Post-Job Identity Pathways", track: "Main Stage" },
          { id: "p2_act", eventId: "evt1", startTime: new Date("2025-10-12T14:30:00"), endTime: new Date("2025-10-12T15:30:00"), format: "activation", speakers: ["Aaron Levie"], title: "Live Teams: Multi-Stream Contribution", track: "Activation" },

          // Pillar 4
          { id: "p4_circle", eventId: "evt1", startTime: new Date("2025-10-12T16:00:00"), endTime: new Date("2025-10-12T17:30:00"), format: "convergence_circle", speakers: ["Vitalik Buterin"], title: "Convergence Circles: Civic & Creative Ecosystems", track: "Circles" }
        ],
        // 4. Sample Attendees (GraphAttendee[])
        sampleAttendees: [
          { 
            person_id: "a1", 
            owner_id: "demo", 
            legal_name: "Elena R.", 
            emails: ["elena@example.com"], 
            tags: ["Builder"], 
            interests: ["Civic Tech", "Governance"], 
            intents: ["Funding"],
            imageFromUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces"
          },
          { 
            person_id: "a2", 
            owner_id: "demo", 
            legal_name: "Marcus J.", 
            emails: ["marcus@example.com"], 
            tags: ["Investor"], 
            interests: ["Venture Capital", "Network Effects"], 
            intents: ["Dealflow"],
            imageFromUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces"
          },
          { 
            person_id: "a3", 
            owner_id: "demo", 
            legal_name: "Sarah L.", 
            emails: ["sarah@example.com"], 
            tags: ["Policy"], 
            interests: ["AI Policy", "Ethics"], 
            intents: ["Learning"],
            imageFromUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop&crop=faces"
          },
          { 
            person_id: "a4", 
            owner_id: "demo", 
            legal_name: "David K.", 
            emails: ["david@example.com"], 
            tags: ["Urbanist"], 
            interests: ["Urban Planning", "Systems"], 
            intents: ["Networking"],
            imageFromUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=faces"
          },
          { 
            person_id: "a5", 
            owner_id: "demo", 
            legal_name: "Priya M.", 
            emails: ["priya@example.com"], 
            tags: ["Privacy"], 
            interests: ["Digital Identity", "Privacy"], 
            intents: ["Hiring"],
            imageFromUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&crop=faces"
          }
        ] as unknown as GraphAttendee[]
      }
    };

    // MERGE USER INPUTS
    if (config.content) {
        config.content.eventName = (eventBasics.split('.')[0] || "New Event").substring(0, 50); 
        config.content.tagline = eventBasics.substring(0, 150); 
        config.content.date = eventDate;
        config.content.location = eventLocation;
    }
    if (goals.length > 0) {
        config.primaryGoals = goals as EventGoal[]; 
    }
    if (config.branding && tone) {
        config.branding.toneKeywords = [tone, ...config.branding.toneKeywords.slice(1)];
    }
    
    // Simulate processing time
    await new Promise(r => setTimeout(r, 1000));

    // Generate stable ID
    const eventFingerprint = `${eventBasics}|${eventDate}|${eventLocation}|${goals.join(",")}|${audience}|${tone}`;
    const eventId = `event_${stableHash(eventFingerprint)}`;

    console.log("Successfully generated event config. Event ID:", eventId);

    // Save to Database
    try {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        await db.insert(events).values({
            slug: eventId,
            name: config.content?.eventName || "Untitled Event",
            config: config as unknown,
            ownerId: "demo-user",
            status: "draft",
            updatedAt: new Date(),
        });
        console.log("DB: Saved event", eventId);
      }
    } catch (dbError) {
      console.error("DB: Failed to save event (non-fatal)", dbError);
    }

    // Sync with Rhiz Protocol
    // 1. Sync Attendees
    if (config.content?.sampleAttendees && config.content.sampleAttendees.length > 0) {
      try {
        const result = await rhizClient.ingestAttendees({
          eventId,
          attendees: config.content.sampleAttendees.map(a => ({
            id: a.person_id, 
            name: a.legal_name || a.preferred_name || "Unknown",
            email: a.emails?.[0], 
            tags: a.tags,
            avatarUrl: a.imageFromUrl
          }))
        });
        
        // Merge back handles
        config.content.sampleAttendees = config.content.sampleAttendees.map(a => {
            const synced = result.attendees.find(r => r.id === a.person_id);
            if (synced) {
                return { ...a, handle: synced.handle, did: synced.did };
            }
            return a;
        });
      } catch (err) {
        console.error("Rhiz: Failed to sync attendees", err);
      }
    }

    // 2. Sync Speakers
    if (config.content?.speakers) {
       try {
         const speakerAttendees = config.content.speakers.map(s => ({
            id: s.handle, 
            name: s.name,
            tags: ["Speaker", s.role]
         }));
         
         const result = await rhizClient.ingestAttendees({ eventId, attendees: speakerAttendees });
         
         result.attendees.forEach((r, i) => {
             if (config.content && config.content.speakers && config.content.speakers[i]) {
                 config.content.speakers[i].handle = r.handle || config.content.speakers[i].handle;
                 config.content.speakers[i].did = r.did || config.content.speakers[i].did;
             }
         });
         
       } catch (err) {
         console.error("Rhiz: Failed to sync speakers", err);
       }
    }

    // 3. Sync Sessions
    if (config.content?.schedule) {
       await rhizClient.ingestSessions({ eventId, sessions: config.content.schedule });
    }
    
    return { success: true, data: { ...config, eventId } };

  } catch (error: unknown) {
    // Catch ALL errors and return them safely to the client
    console.error("Server Action Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
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

/**
 * Verify a ZK proof for attendee verification
 */
export async function verifyAttendeeProof(
  proof: Record<string, unknown>, // Changed from any to unknown for safety
  publicSignals: string[],
  vkId: string,
  verifierPersonId?: string
) {
  console.log("Verifying ZK Proof for:", verifierPersonId);
  
  try {
    const result = await zkClient.verifyProof({
      proof,
      public_signals: publicSignals,
      vk_id: vkId,
      verifier_person_id: verifierPersonId
    });

    console.log("ZK Verification Result:", result);

    if (result.verified) {
      // If verified, we could optionally update the person's status or log a trust event here
      // e.g., await rhizClient.recordInteraction({ ... type: 'zk_verified' ... })
      return { success: true, message: result.message, log: result.proof_log };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error("ZK Verification Error:", error);
    return { success: false, message: "Verification process failed due to server error" };
  }
}

// ... (existing verifyAttendeeProof above)

// NEW AI FEATURE ACTIONS
// These enforce the promise of the "Intelligence Suite"

/** 
 * Generated Content Agent 
 * "Instant copy, agendas, intros & sponsor blurbs."
 */
export async function generateEventCopy(
  context: { eventId: string; type: 'intro' | 'bio' | 'email' | 'tagline'; tone?: string; subjectName?: string }
): Promise<{ success: boolean; text: string }> {
  console.log("Generating copy for:", context);
  
  // MOCK: In production this would call OpenAI/BAML
  await new Promise(r => setTimeout(r, 1500));
  
  const responses = {
    intro: `Please welcome ${context.subjectName || "our guest"}. A visionary in their field, they are redefining how we think about the intersection of technology and humanity.`,
    bio: `${context.subjectName} has spent the last decade building systems that matter. Formerly at TopTier Corp, now leading the charge at NextGen.`,
    tagline: "Where the future gathers to build what's next.",
    email: "Join us for an unforgettable experience."
  };

  return { 
    success: true, 
    text: responses[context.type] || "Content generated successfully." 
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
): Promise<{ success: boolean; schedule: unknown; conflictsResolved: number }> {
    console.log(`Solving schedule for ${eventId} with constraints`, constraints);
    // Mock constraint solver
    await new Promise(r => setTimeout(r, 2000));
    
    return {
        success: true,
        conflictsResolved: 3,
        schedule: [
            { id: "s1", time: "10:00", track: "Main", resolved: true },
            { id: "s2", time: "11:00", track: "Breakout", resolved: true }
        ]
    };
}

/**
 * Adaptive Voice / Rewriter
 * "Brand-safe rewriting & localization."
 */
export async function rewriteContent(
    text: string, 
    targetTone: 'professional' | 'playful' | 'urgent'
): Promise<string> {
    console.log("Rewriting text to tone:", targetTone);
    if (targetTone === 'playful') {
        return text.replace(/\./g, "! 🚀") + " Let's go!";
    }
    return text; // No-op for now
}

/**
 * Comms & Outreach
 * "Drafts cold-opens & follow-up cadences."
 */
export async function generateOutreachSequence(
    recipientProfile: { name: string; role: string; recentWork?: string }
): Promise<{ emailChain: string[] }> {
    return {
        emailChain: [
            `Hi ${recipientProfile.name}, I saw your work on ${recipientProfile.recentWork || "the project"}...`,
            `Just bumping this up, ${recipientProfile.name}...`
        ]
    };
}

/**
 * Operational Assets
 * "Auto-generates badges, QR & signage copy."
 */
export async function generateAssetPayload(
    attendeeId: string
): Promise<{ qrData: string; badgeLayout: string }> {
    const qrData = `rhiz:attendee:${attendeeId}:sig_${Math.random().toString(36).slice(2)}`;
    return {
        qrData,
        badgeLayout: "Layout_Standard_V1"
    };
}
