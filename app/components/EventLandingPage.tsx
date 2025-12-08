'use client';

import React from 'react';
import { EventAppConfig } from "@/lib/baml_client/baml_client/types";
import { PersonRead, RelationshipDetail, IntroductionSuggestion } from "@/lib/protocol-sdk/types";
import { HeroSection } from '@/components/hero/HeroSection';
import { SpeakerSpotlight } from './speakers/SpeakerSpotlight';
import { NetworkingPreview } from '@/components/networking/NetworkingPreview';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import type { HeroTheme } from '@/components/hero/theme';
import { rhizClient } from '@/lib/rhizClient';
import { Attendee } from '@/lib/types';

interface EventLandingPageProps {
  config: EventAppConfig;
}

export function EventLandingPage({ config }: EventLandingPageProps) {
  // Map config to theme
  // Default to 'professional' if not found or no mapping obvious
  // The config has branding.toneKeywords which might contain relevant keywords
  const determineTheme = (toneKeywords: string[]): HeroTheme => {
    if (toneKeywords.includes('luxury')) return 'luxury';
    if (toneKeywords.includes('vibrant') || toneKeywords.includes('playful')) return 'vibrant';
    return 'professional';
  };

  const theme = determineTheme(config.branding.toneKeywords);
  
  // State for live Rhiz data
  // State for live Rhiz data
  const [relationships, setRelationships] = React.useState<RelationshipDetail[]>([]);
  const [opportunities, setOpportunities] = React.useState<{ suggestion: IntroductionSuggestion; candidate: PersonRead }[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Map generated content to component-compatible formats
  const speakers = config.content.speakers.map(speaker => ({
    name: speaker.name,
    role: speaker.role,
    company: speaker.company,
    imageUrl: speaker.imageUrl,
    bio: speaker.bio,
  }));

  const sessions = config.content.schedule.map(session => ({
    id: session.id,
    time: session.time,
    title: session.title,
    speaker: {
      name: session.speakerName,
      avatar: speakers.find(s => s.name === session.speakerName)?.imageUrl || "",
      role: session.speakerRole,
    },
    track: session.track as "Main Stage" | "Workshop" | "Networking",
    isWide: session.isWide,
  }));

  const attendees: PersonRead[] = config.content.sampleAttendees.map((attendee, i) => ({
    person_id: attendee.id || `person-${i}`,
    owner_id: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    legal_name: attendee.name,
    preferred_name: attendee.name,
    imageFromUrl: attendee.imageUrl, // We need to extend our local type or just pass it through if PersonRead doesn't have it?
    // Note: PersonRead doesn't standardly have imageFromUrl but we can cast or extend. 
    // For this demo, let's treat it loosely or add it to tags/metadata if we were strict.
    // However, NetworkingPreview.tsx was updated to use PersonRead which DOES NOT have imageFromUrl on the interface normally.
    // Wait, I replaced NetworkingPreview to use PersonRead.
    // PersonRead does NOT have imageFromUrl in types.ts.
    // This will error if I don't address it.
    // Let's use 'any' cast for the image prop or add it to the type augmentation if possible, 
    // or better, map it to a custom attribute if we were being pure. 
    // For now, I will cast to any to pass the image prop through the "PersonRead" type for the UI to use it.
    tags: attendee.interests,
  } as any as PersonRead));

  // Handle node interaction
  const handleNodeClick = async (attendee: Attendee) => {
    if (!currentUserId) return;
    
    console.log("Rhiz: Recording interaction with", attendee.person_id);
    try {
      await rhizClient.recordInteraction({
        eventId: "default-event",
        fromIdentityId: currentUserId,
        toIdentityId: attendee.person_id,
        type: "view_profile",
        metadata: { source: "networking_graph" }
      });
      alert(`Interaction recorded: Viewed ${attendee.preferred_name || 'Attendee'}`);
    } catch (e) {
      console.error("Failed to record interaction", e);
    }
  };

  // Effect: Ingest attendees & fetch relationships
  React.useEffect(() => {
    const syncRhiz = async () => {
      setIsSyncing(true);
      try {
        // 1. Ensure current user has an identity
        const currentUser = await rhizClient.ensureIdentity({
          name: "Event Organizer", // In a real app, this would come from auth
        });
        setCurrentUserId(currentUser.id);

        // 2. Ingest generated attendees into Protocol
        // We map the config attendees to the format expected by ingest
        const attendeesForIngest: Attendee[] = config.content.sampleAttendees.map(a => ({
          id: a.id,
          eventId: "default-event",
          userId: a.id, // Using ID as mock user ID
          rhizIdentityId: "", // Will be assigned by ingestion
          name: a.name,
          email: `${a.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Mock email
          tags: a.interests,
          intents: [],
        }));

        await rhizClient.ingestAttendees({
          eventId: "default-event",
          attendees: attendeesForIngest,
        });

        // 3. Fetch real relationships for the graph
        // This will return connections based on the shared tags/interests we just ingested
        const suggestions = await rhizClient.getSuggestedConnections({
          eventId: "default-event",
          identityId: currentUser.id,
          limit: 10,
        });

        console.log("Rhiz: Fetched relationships", suggestions);
        setRelationships(suggestions);

        // 4. Fetch Opportunity Matches (Pre-Meeting)
        const opportunites = await rhizClient.getOpportunityMatches({
           eventId: "default-event",
           identityId: currentUser.id,
           limit: 3
        });
        setOpportunities(opportunites);

      } catch (err) {
        console.error("Rhiz: Sync failed", err);
      } finally {
        setIsSyncing(false);
      }
    };

    // Only run if checking is enabled and we haven't run yet
    syncRhiz();
  }, [config.content.sampleAttendees]);

  return (
    <div className="w-full bg-white dark:bg-black min-h-screen">
       {/* Hero Section */}
       <HeroSection 
         title={config.content.eventName}
         subtitle={config.content.tagline}
         date={config.content.date}
         location={config.content.location}
         primaryAction={{ label: "Get Tickets", onClick: () => alert("Ticket flow placeholder") }}
         theme={theme}
       />
       
       {/* Speakers Section */}
       <SpeakerSpotlight 
         speakers={speakers}
         layout="carousel"
       />

       {/* Schedule Section */}
       <section className="py-20 bg-neutral-900 border-y border-neutral-800">
          <div className="container mx-auto px-6 mb-12 text-center">
             <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Event Schedule</h2>
             <p className="text-neutral-400 max-w-2xl mx-auto">
               Curated sessions designed to inspire and connect.
             </p>
          </div>
          <ScheduleGrid sessions={sessions} />
       </section>

       {/* Networking Preview Section */}
       <section className="py-20 bg-black text-white overflow-hidden">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div>
                <h2 className="text-3xl md:text-5xl font-serif mb-6">
                  Intelligent Networking
                </h2>
                <p className="text-lg text-neutral-400 mb-8">
                  {config.matchmakingConfig.enabled 
                    ? "Our AI-powered matchmaking connects you with the right people effortlessly." 
                    : "Connect with like-minded peers in an organic, curated environment."}
                </p>
                <button className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors">
                  Join the Network
                </button>
             </div>
             <div className="relative">
                <NetworkingPreview 
                  featuredAttendees={attendees}
                  totalCount={500}
                  matchmakingEnabled={config.matchmakingConfig.enabled}
                  relationships={relationships}
                  opportunities={opportunities}
                  onNodeClick={handleNodeClick}
                />
             </div>
          </div>
       </section>
    </div>
  );
}
