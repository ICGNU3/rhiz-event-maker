class ConnectionReason {
  reasonSummary string
  talkingPoints string[]
}

function GenerateConnectionReason(
  attendeeA: string,
  attendeeB: string,
  sharedTags: string[],
  sharedIntents: string[]
) -> ConnectionReason {
  client GPT4
  prompt #"
    Generate a reason why Attendee A should meet Attendee B.

    Attendee A: {{ attendeeA }}
    Attendee B: {{ attendeeB }}
    Shared Tags: {{ sharedTags }}
    Shared Intents: {{ sharedIntents }}

    Output a concise summary (1-2 sentences) and 3 bullet points for conversation starters.
  "#
}
