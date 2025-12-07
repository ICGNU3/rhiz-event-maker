class AttendeeProfile {
  tags string[]
  intents string[]
  confidenceScores map<string, float>
}

function AnalyzeAttendeeProfile(
  bio: string,
  whatTheyAreLookingFor: string,
  whatTheyCanOffer: string,
  eventGoals: string[]
) -> AttendeeProfile {
  client GPT4
  prompt #"
    Analyze the attendee's profile to extract structured tags and intents.
    
    Attendee Data:
    - Bio: {{ bio }}
    - Looking For: {{ whatTheyAreLookingFor }}
    - Offering: {{ whatTheyCanOffer }}
    
    Event Goals: {{ eventGoals }}

    Output structured tags (skills, interests, roles) and intents (goals for this event).
    Intents should align with event goals where possible.
  "#
}
