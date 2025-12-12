# Rhiz Protocol Integration

The Event Architect app now integrates with Rhiz Protocol to track attendee relationships and networking interactions.

## Setup

The SDK is installed locally from the `rhizprotocol` repository:

```bash
# Already done - SDK installed from ../rhizprotocol/sdk/typescript
```

## Usage

### Import the client

```typescript
import {
  rhizClient,
  logEventInteraction,
  syncAttendee,
} from "@/lib/rhiz-client";
```

### Log networking interactions

When two attendees connect at an event:

```typescript
await logEventInteraction({
  eventId: event.id,
  eventName: event.name,
  attendee1Id: attendee1.rhizPersonId,
  attendee2Id: attendee2.rhizPersonId,
  ownerId: event.organizerId,
  context: "booth_visit", // or "session", "networking_break", etc.
  notes: "Discussed funding opportunities",
});
```

### to Rhiz

When someone registers for an event:

```typescript
const person = await syncAttendee({
  ownerId: event.organizerId,
  attendee: {
    email: registration.email,
    name: registration.name,
    company: registration.company,
    role: registration.jobTitle,
  },
});

// Store person.person_id for future interactions
```

### Get recommended connections

```typescript
const recommendations = await getRecommendedConnections(
  attendee.rhizPersonId,
  event.organizerId,
  event.id
);

// Show recommendations in UI
```

## Environment Variables

Add to your `.env.local`:

```bash
RHIZ_API_URL=http://localhost:8000  # or your deployed API URL
```

## Authentication

Currently using public endpoints (no auth token). To enable authenticated requests:

1. Update `getAccessToken` in `lib/rhiz-client.ts`:

```typescript
getAccessToken: async () => {
  // Example with Clerk
  const session = await auth();
  return session?.token || null;

  // Or with Supabase
  // const { data } = await supabase.auth.getSession();
  // return data.session?.access_token || null;
},
```

## Features Available

- ✅ Log event interactions (with idempotency)
- ✅ Sync attendees as people
- ✅ Get relationship recommendations
- 🚧 Find warm introduction paths (TODO)
- 🚧 Network analysis for events (TODO)

## Next Steps

1. Integrate interaction logging into your matchmaking flow
2. Add "introduce" buttons powered by Rhiz relationship data
3. Show attendee network visualization using Rhiz graph data
4. Track event ROI through relationship strength metrics
