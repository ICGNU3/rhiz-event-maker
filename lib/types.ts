import { PersonRead } from "@/lib/protocol-sdk/types";

// ... existing types ...

export type GraphAttendee = PersonRead & {
  imageFromUrl?: string;
  interests?: string[];
};

export type ScrapedEventData = {
  title?: string;
  date?: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  source?: string;
  hosts?: string[];
  goals?: string;
  audience?: string;
  tone?: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  ownerUserId: string;
  createdAt: Date;
};

export type EventGoal =
  | "dealflow"
  | "community_building"
  | "education"
  | "healing"
  | "movement_building"
  | "internal_offsite"
  | "fundraising"
  | "networking"
  | "career_fair";

export type EventStatus = "draft" | "published" | "archived";

export type VenueType = "virtual" | "in_person" | "hybrid";

export type TicketTier = {
  id: string;
  name: string;
  price: number; // In cents/lowest unit
  currency: string;
  features: string[];
  capacity?: number;
  paymentUrl?: string; // External payment link (Stripe, Luma, etc.)
  description?: string;
};

export type SponsorTier = {
  id: string;
  name: string;
  minContribution: number;
  benefits: string[];
  sponsors: Organization[];
};

export type Speaker = {
  name: string;
  role: string;
  company: string;
  bio: string;
  imageUrl?: string;
  handle?: string; // Rhiz handle
  did?: string; // Rhiz DID
};

export type Event = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  timeZone: string;
  venueType: VenueType;
  status: EventStatus;
};

export type AttendeeProfileField = {
  id: string;
  label: string;
  type: "text" | "select" | "tags" | "textarea";
  required: boolean;
  options?: string[];
};

export type EventAppConfig = {
  id: string;
  eventId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  primaryGoals: EventGoal[];
  attendeeProfileFields: AttendeeProfileField[];
  matchmakingConfig: {
    enabled: boolean;
    inputSignals: string[];
    matchTypes: string[];
    meetingDurations: number[];
  };
  sessionConfig: {
    tracksEnabled: boolean;
    maxConcurrentSessions: number;
    sessionTypes: string[];
  };
  engagementConfig: {
    chatEnabled: boolean;
    qnaEnabled: boolean;
    pollsEnabled: boolean;
    liveFeedEnabled: boolean;
  };
  relationshipFeatures: {
    relationshipScoresVisible: boolean;
    warmPathHintsEnabled: boolean;
    introRequestsEnabled: boolean;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    logoUrl?: string;
    wordmark?: string;
    toneKeywords: string[];
  };
  designNotes?: string;
  backgroundImage?: string;
  
  // New "Ingest" Fields
  ticketing?: {
    tiers: TicketTier[];
    enabled: boolean;
  };
  venueConstraints?: {
    maxCapacity: number;
    roomConstraints: Record<string, { capacity: number; avFeatures: string[] }>;
    accessibilityFeatures: string[];
  };
  sponsors?: {
    tiers: SponsorTier[];
    assets: Record<string, string>; // e.g. "tier_1_logo_url"
  };
  legal?: {
    codeOfConductUrl?: string;
    privacyPolicyUrl?: string;
    photoConsentRequired: boolean;
    termsOfServiceUrl?: string;
  };
  successMetrics?: {
    targetNps?: number;
    pipelineTargets?: { value: string; currency: string };
  };
  contentGuardrails?: {
    brandVoiceGuidelines: string;
    tabooTopics: string[];
    sensitiveTopics: string[];
  };
  content?: {
    eventName?: string;
    tagline?: string;
    date?: string;
    location?: string;
    speakers?: Speaker[];
    schedule?: Session[];
    sampleAttendees?: GraphAttendee[]; // Updated to GraphAttendee to include detailed info
  };
};

export type Attendee = {
  id: string;
  eventId: string;
  userId: string;
  rhizIdentityId: string;
  name: string;
  email: string;
  headline?: string;
  company?: string;
  tags: string[];
  intents: string[];
};

export type Session = {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  format: string;
  track?: string;
  room?: string;
  capacity?: number;
  speakers: string[];
};

export type ConnectionSuggestion = {
  targetAttendeeId: string;
  score: number;
  reasonSummary: string;
  sharedTags: string[];
  sharedIntents: string[];
  talkingPoints: string[];
};

export type NotificationChannel = "email" | "sms" | "push" | "in_app";

export type NotificationContext = {
  eventId: string;
  recipientId: string;
  messageType: "invite" | "update" | "reminder" | "match";
  priority: "high" | "low" | "normal";
};

