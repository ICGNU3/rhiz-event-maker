class EventAppConfig {
  primaryGoals string[] @description("List of primary goals for the event")
  matchmakingConfig MatchmakingConfig
  sessionConfig SessionConfig
  engagementConfig EngagementConfig
  relationshipFeatures RelationshipFeatures
  branding Branding
  designNotes string @description("Explanation of design choices")
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
    Based on the organizer's inputs, generate a complete EventAppConfig.

    Organizer Inputs:
    - Basics: {{ eventBasics }}
    - Goals: {{ goals }}
    - Audience: {{ audience }}
    - Relationship Intent: {{ relationshipIntent }}
    - Session Shape: {{ sessionShape }}
    - Matchmaking Appetite: {{ matchmakingAppetite }}
    - Tools: {{ tools }}
    - Tone: {{ tone }}

    Guidelines:
    - If goals include "networking" or "dealflow", enable matchmaking and relationship features.
    - If tone is "professional", use subdued colors. If "vibrant", use bold colors.
    - Ensure at least one relationship feature is enabled.
    - Return a valid JSON object matching the EventAppConfig schema.
  "#
}
