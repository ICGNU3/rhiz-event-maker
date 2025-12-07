class EventAppConfig {
  primaryGoals string[] @description("List of primary goals for the event")
  matchmakingConfig MatchmakingConfig
  sessionConfig SessionConfig
  engagementConfig EngagementConfig
  relationshipFeatures RelationshipFeatures
  branding Branding
  designNotes string @description("Explanation of design choices")
  content EventContent @description("Actual event content for display")
}

class EventContent {
  eventName string @description("Name of the event")
  tagline string @description("Brief tagline or subtitle for the event")
  date string @description("Event date(s), e.g., 'Oct 12-14, 2025'")
  location string @description("Event location")
  speakers Speaker[] @description("List of featured speakers (3-5 speakers)")
  schedule ScheduleSession[] @description("Event schedule with sessions (5-8 sessions)")
  sampleAttendees SampleAttendee[] @description("Sample attendee profiles for networking preview (5-7 attendees)")
}

class Speaker {
  name string
  role string
  company string
  imageUrl string @description("Placeholder image URL from unsplash.com for professional headshots")
  bio string @description("Short bio (1-2 sentences)")
}

class ScheduleSession {
  id string
  time string @description("Session time, e.g., '09:00 AM'")
  title string
  speakerName string
  speakerRole string
  track string @description("One of: 'Main Stage', 'Workshop', 'Networking'")
  isWide bool @description("True for keynotes/main sessions that should span full width")
}

class SampleAttendee {
  id string
  name string
  imageUrl string @description("Placeholder image URL from unsplash.com")
  interests string[] @description("2-3 key interests or tags")
}

class MatchmakingConfig {
  enabled bool
  inputSignals string[]
  matchTypes string[]
  meetingDurations int[]
}

class SessionConfig {
  tracksEnabled bool
  maxConcurrentSessions int
  sessionTypes string[]
}

class EngagementConfig {
  chatEnabled bool
  qnaEnabled bool
  pollsEnabled bool
  liveFeedEnabled bool
}

class RelationshipFeatures {
  relationshipScoresVisible bool
  warmPathHintsEnabled bool
  introRequestsEnabled bool
}

class Branding {
  primaryColor string
  accentColor string
  toneKeywords string[]
}

function GenerateEventAppConfig(
  eventBasics: string,
  eventDate: string,
  eventLocation: string,
  goals: string[],
  audience: string,
  relationshipIntent: string,
  sessionShape: string,
  matchmakingAppetite: string,
  tools: string,
  tone: string
) -> EventAppConfig {
  client GPT4
  prompt #"
    You are an expert event app designer using the Rhiz Protocol.
    Based on the organizer's inputs, generate a complete EventAppConfig with both configuration AND actual event content.

    Organizer Inputs:
    - Basics: {{ eventBasics }}
    - Date: {{ eventDate }}
    - Location: {{ eventLocation }}
    - Goals: {{ goals }}
    - Audience: {{ audience }}
    - Relationship Intent: {{ relationshipIntent }}
    - Session Shape: {{ sessionShape }}
    - Matchmaking Appetite: {{ matchmakingAppetite }}
    - Tools: {{ tools }}
    - Tone: {{ tone }}

    Guidelines for Configuration:
    - If goals include "networking" or "dealflow", enable matchmaking and relationship features.
    - If tone is "professional", use subdued colors. If "vibrant", use bold colors.
    - Ensure at least one relationship feature is enabled.
    
    Guidelines for Event Content:
    - Generate a creative, realistic event name and tagline based on the event basics
    - Use the EXACT date provided: {{ eventDate }}
    - Use the EXACT location provided: {{ eventLocation }}
    - Create 3-5 diverse, credible speakers with professional headshot URLs from unsplash.com
    - Design 5-8 schedule sessions that align with the event goals and audience
    - Include a mix of session types: keynotes (isWide=true), workshops, and networking breaks
    - Create 5-7 sample attendee profiles with diverse interests relevant to the event
    - Use appropriate unsplash.com image URLs for all headshots and avatars
    - Ensure names, roles, and companies sound realistic and professional
    
    {{ ctx.output_format }}
  "#
}

