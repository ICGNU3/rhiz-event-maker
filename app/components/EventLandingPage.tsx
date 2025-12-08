'use client';

import React from 'react';
import { EventAppConfig } from "@/lib/baml_client/baml_client/types";
import { PersonRead, RelationshipDetail, IntroductionSuggestion } from "@/lib/protocol-sdk/types";
import { HeroSection } from '@/components/hero/HeroSection';
import { SpeakerSpotlight } from './speakers/SpeakerSpotlight';
import { NetworkingGraph } from '@/components/networking/NetworkingGraph';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import type { HeroTheme } from '@/components/hero/theme';
import { rhizClient } from '@/lib/rhizClient';
import type { GraphAttendee as NetworkingAttendee } from '@/lib/types';
import { AttendeeDetailModal } from '@/components/networking/AttendeeDetailModal';
import { Speaker } from './speakers/SpeakerCard';

interface EventLandingPageProps {
  config: EventAppConfig & { eventId?: string };
}


interface ContentAttendee {
  id?: string;
  name: string;
  imageUrl?: string;
  interests?: string[];
  handle?: string;
  did?: string;
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
  const [relationships, setRelationships] = React.useState<RelationshipDetail[]>([]);
  const [opportunities, setOpportunities] = React.useState<{ suggestion: IntroductionSuggestion; candidate: PersonRead }[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // State for selected attendee
  const [selectedAttendee, setSelectedAttendee] = React.useState<NetworkingAttendee | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Default to loading while syncing


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

  // Map generated content to component-compatible formats matching Protocol types
  const attendees: NetworkingAttendee[] = config.content.sampleAttendees.map((attendee, i) => {
    const a = attendee as unknown as ContentAttendee;
    return {
      person_id: a.id || `person-${i}`,
      owner_id: "system",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      legal_name: a.name,
      preferred_name: a.name,
      imageFromUrl: a.imageUrl, 
      tags: a.interests || [],
      phones: [],
      social_handles: {},
      handle: a.handle,
      did: a.did,
    };
  });

  // Handle node interaction
  const handleNodeClick = async (attendee: NetworkingAttendee) => {
    setSelectedAttendee(attendee);
    setIsModalOpen(true);

    if (!currentUserId) return;
    
    console.log("Rhiz: Recording interaction with", attendee.person_id);
    try {
      await rhizClient.recordInteraction({
        eventId: config.eventId || "default-event",
        fromIdentityId: currentUserId,
        toIdentityId: attendee.person_id,
        type: "view_profile",
        metadata: { source: "networking_graph" }
      });
      // alert(`Interaction recorded: Viewed ${attendee.preferred_name || 'Attendee'}`); // Removed alert
    } catch (e) {
      console.error("Failed to record interaction", e);
    }
  };

  const handleSpeakerClick = async (speaker: Speaker) => { 
     if (!currentUserId) return;
     
     // We need to find the person ID for this speaker.
     // Since we mocked ingestion, we can rely on a deterministic ID or lookup.
     // For this demo, let's assume we can map back via name or the ID we assigned during ingestion.
     // In the useEffect below, we'll assign IDs to speakers.
     
     const speakerId = speaker.id || `speaker_${speaker.name.replace(/\s+/g, '_')}`;

     console.log("Rhiz: Recording interaction with speaker", speakerId);
     try {
       await rhizClient.recordInteraction({
         eventId: config.eventId || "default-event",
         fromIdentityId: currentUserId,
         toIdentityId: speakerId,
         type: "view_speaker",
         metadata: { source: "speaker_spotlight" }
       });
       alert(`Interaction recorded: Viewed Speaker ${speaker.name}`);
     } catch (e) {
       console.error("Failed to record speaker interaction", e);
     }
  };

  // Effect: Ingest attendees & fetch relationships
  React.useEffect(() => {
    const syncRhiz = async () => {
      try {
        setIsLoading(true);
        // 1. Ensure current user has an identity
        const currentUser = await rhizClient.ensureIdentity({
          name: "Event Organizer", 
        });
        setCurrentUserId(currentUser.id);

        if (!config.eventId) {
          console.warn("Rhiz: No event ID provided in config, skipping Protocol sync");
          setIsLoading(false);
          return;
        }

        const eventId = config.eventId;

        // 2. Fetch real relationships for the graph
        const suggestions = await rhizClient.getSuggestedConnections({
          eventId,
          identityId: currentUser.id,
          limit: 10,
        });

        console.log("Rhiz: Fetched relationships", suggestions);
        setRelationships(suggestions);

        // 3. Fetch Opportunity Matches (Pre-Meeting)
        const opportunites = await rhizClient.getOpportunityMatches({
           eventId,
           identityId: currentUser.id,
           limit: 3
        });
        setOpportunities(opportunites);

      } catch (err) {
        console.error("Rhiz: Sync failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run if checking is enabled and we haven't run yet
    syncRhiz();
  }, [config.content.sampleAttendees, config.content.speakers, config.eventId]);

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
         speakers={speakers.map(s => ({ ...s, id: `speaker_${s.name.replace(/\s+/g, '_')}` }))}
         layout="carousel"
         onSpeakerClick={handleSpeakerClick}
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
                <NetworkingGraph 
                  featuredAttendees={attendees}
                  totalCount={500}
                  matchmakingEnabled={config.matchmakingConfig.enabled}
                  relationships={relationships}
                  opportunities={opportunities}
                  onNodeClick={handleNodeClick}
                  isLoading={isLoading}
                />
             </div>
          </div>
       </section>

       {/* Interactive Modal */}
       <AttendeeDetailModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         attendee={selectedAttendee}
       />
    </div>
  );
}
