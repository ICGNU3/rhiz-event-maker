'use client';

import React from 'react';
import { EventAppConfig } from '@/lib/types';
import { RelationshipDetail, OpportunityMatch, PersonRead } from '@/lib/protocol-sdk/types';
import { HeroSection } from '@/components/hero/HeroSection';
import { SpeakerSpotlight } from './speakers/SpeakerSpotlight';
import { NetworkingGraph } from '@/components/networking/NetworkingGraph';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import type { HeroTheme } from '@/components/hero/theme';
import { rhizClient } from '@/lib/rhizClient';
import type { GraphAttendee as NetworkingAttendee } from '@/lib/types';
import { AttendeeDetailModal } from '@/components/networking/AttendeeDetailModal';
import { Speaker } from './speakers/SpeakerCard';
import { useToast } from '@/components/ui/ToastProvider';
import { RegistrationModal } from '@/components/registration/RegistrationModal';
import { EventFooter } from '@/components/footer/EventFooter';
import { EventActions } from '@/components/EventActions';
import { MapPreviewCard } from '@/components/MapPreviewCard';

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

type InteractionJob = {
  toIdentityId: string;
  type: string;
  metadata?: Record<string, unknown>;
};

const determineTheme = (toneKeywords: string[]): HeroTheme => {
  if (toneKeywords.includes('luxury')) return 'luxury';
  if (toneKeywords.includes('vibrant') || toneKeywords.includes('playful')) return 'vibrant';
  return 'professional';
};

export function EventLandingPage({ config }: EventLandingPageProps) {
  const theme = determineTheme(config.branding.toneKeywords);
  const { pushToast } = useToast();

  const [relationships, setRelationships] = React.useState<(RelationshipDetail & { person?: PersonRead })[]>([]);
  const [opportunities, setOpportunities] = React.useState<OpportunityMatch[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [selectedAttendee, setSelectedAttendee] = React.useState<NetworkingAttendee | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [graphError, setGraphError] = React.useState<Error | null>(null);
  const [userProfile, setUserProfile] = React.useState<{ name: string; email: string } | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(0);

  const pendingInteractions = React.useRef<InteractionJob[]>([]);
  const queueKey = React.useMemo(
    () => `rhiz_queue_${config.eventId || 'default'}`,
    [config.eventId]
  );

  // Restore queued interactions on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(queueKey);
      if (saved) {
        const parsed = JSON.parse(saved) as InteractionJob[];
        if (Array.isArray(parsed)) {
          pendingInteractions.current = parsed;
          setPendingCount(parsed.length);
        }
      }
    } catch (err) {
      console.warn('Failed to restore queued interactions', err);
    }
  }, [queueKey]);

  const persistQueue = React.useCallback(() => {
    try {
      localStorage.setItem(queueKey, JSON.stringify(pendingInteractions.current));
    } catch (err) {
      console.warn('Failed to persist interaction queue', err);
    }
    setPendingCount(pendingInteractions.current.length);
  }, [queueKey]);

  // Restore saved identity
  React.useEffect(() => {
    const saved = localStorage.getItem(`rhiz_user_${config.eventId || 'default'}`);
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse user session', err);
      }
    }
  }, [config.eventId]);

  const persistUserProfile = React.useCallback(
    (profile: { name: string; email: string }) => {
      setUserProfile(profile);
      localStorage.setItem(`rhiz_user_${config.eventId || 'default'}`, JSON.stringify(profile));
    },
    [config.eventId]
  );

  const recordInteractionWithRetry = React.useCallback(
    async (job: InteractionJob, successMessage?: string) => {
      const eventId = config.eventId || 'default-event';

      const enqueue = () => {
        pendingInteractions.current.push(job);
        persistQueue();
      };

      if (!currentUserId) {
        enqueue();
        return;
      }

      try {
        await rhizClient.recordInteraction({
          eventId,
          fromIdentityId: currentUserId,
          toIdentityId: job.toIdentityId,
          type: job.type,
          metadata: job.metadata,
        });

        if (successMessage) {
          pushToast({ title: successMessage, variant: 'success' });
        }
      } catch (err) {
        console.warn('Rhiz: interaction failed, queuing', err);
        enqueue();
        pushToast({ title: 'Saved to send later', description: 'We will retry when connected.', variant: 'info' });
      }
    },
    [config.eventId, currentUserId, persistQueue, pushToast]
  );

  const flushQueuedInteractions = React.useCallback(async () => {
    if (!currentUserId || pendingInteractions.current.length === 0) return;

    const remaining: InteractionJob[] = [];
    const eventId = config.eventId || 'default-event';

    for (const job of pendingInteractions.current) {
      try {
        await rhizClient.recordInteraction({
          eventId,
          fromIdentityId: currentUserId,
          toIdentityId: job.toIdentityId,
          type: job.type,
          metadata: job.metadata,
        });
      } catch (err) {
        console.warn('Rhiz: replay failed', err);
        remaining.push(job);
      }
    }

    pendingInteractions.current = remaining;
    persistQueue();
    if (remaining.length === 0) {
      pushToast({ title: 'Synced offline actions', variant: 'success' });
    }
  }, [config.eventId, currentUserId, persistQueue, pushToast]);

  const syncRhiz = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setGraphError(null);

      const identityParams = userProfile
        ? { name: userProfile.name, email: userProfile.email }
        : { name: 'Event Organizer' };

      const currentUser = await rhizClient.ensureIdentity(identityParams);
      setCurrentUserId(currentUser.id);

      if (!config.eventId) {
        console.warn('Rhiz: No event ID provided in config, skipping Protocol sync');
        setIsLoading(false);
        return;
      }

      const eventId = config.eventId;

      const [suggestions, matches] = await Promise.all([
        rhizClient.getSuggestedConnections({
          eventId,
          identityId: currentUser.id,
          limit: 10,
        }),
        rhizClient.getOpportunityMatches({
          eventId,
          identityId: currentUser.id,
          limit: 3,
        }),
      ]);

      setRelationships(suggestions);
      setOpportunities(matches);

      await flushQueuedInteractions();
    } catch (err) {
      console.error('Rhiz: Sync failed', err);
      setGraphError(err instanceof Error ? err : new Error(String(err)));
      pushToast({ title: 'Networking unavailable', description: 'We will retry shortly.', variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [config.eventId, flushQueuedInteractions, pushToast, userProfile]);

  React.useEffect(() => {
    syncRhiz();
  }, [syncRhiz]);

  if (!config.content) {
    return <div className="min-h-screen flex items-center justify-center text-white">Event content unavailable</div>;
  }

  type SpeakerWithIdentity = NonNullable<EventAppConfig['content']>['speakers'][number] & {
    id?: string;
    handle?: string;
    did?: string;
  };

  const speakers = config.content.speakers.map((speaker, idx) => {
    const fallbackId = `speaker_${idx}_${speaker.name.replace(/\s+/g, '_')}`;
    const enriched = speaker as SpeakerWithIdentity;
    return {
      id: enriched.id || fallbackId,
      name: speaker.name,
      role: speaker.role,
      company: speaker.company,
      imageUrl: speaker.imageUrl || '',
      bio: speaker.bio,
      handle: enriched.handle,
      did: enriched.did,
    } satisfies Speaker;
  });

  const sessions = config.content.schedule.map((session) => {
    // Cast to any to handle both strict Session type and demo data shape
    const s = session as unknown as Record<string, unknown>;
    
    let timeStr = s.time as string;
    if (!timeStr && s.startTime) {
       try {
         timeStr = new Date(s.startTime as string).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
       } catch {
         timeStr = "TBD";
       }
    }

    let speakerName = s.speakerName as string;
    if (!speakerName && s.speakers && Array.isArray(s.speakers) && s.speakers.length > 0) {
        speakerName = (s.speakers as string[])[0];
    }

    return {
      id: s.id as string,
      time: timeStr || "TBD",
      title: s.title as string,
      description: s.description as string,
      speaker: {
        name: speakerName || "TBD",
        avatar: speakers.find((sp) => sp.name === speakerName)?.imageUrl || '',
        role: s.speakerRole as string || "Speaker",
      },
      track: (s.track as 'Main Stage' | 'Workshop' | 'Networking') || 'Main Stage',
      isWide: !!s.isWide,
    };
  });

  // 1. Base Attendees (from Config/Mock)
  const sampleAttendees: NetworkingAttendee[] = config.content.sampleAttendees.map((attendee, i) => {
    const a = attendee as unknown as ContentAttendee;
    const fallbackId = `person-${i}`;
    return {
      person_id: a.id || fallbackId,
      owner_id: 'system',
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

  // 2. Real Network Attendees (from Protocol Relationships)
  // We cast 'relationships' because we enriched it in rhizClient, but Typescript might only see RelationshipDetail
  const networkAttendees: NetworkingAttendee[] = relationships.map((rel) => {
     if (!rel.person) return null;
     const p = rel.person; // The PersonRead object
     
     // Extract image from social handles or custom attributes if available
     // Ideally Protocol would have a standard avatar field. For now checking common places.
     const avatarUrl = p.social_handles?.avatar || p.social_handles?.image_url;

     return {
         person_id: p.person_id,
         owner_id: p.owner_id,
         created_at: p.created_at,
         updated_at: p.updated_at,
         legal_name: p.legal_name,
         preferred_name: p.preferred_name || p.legal_name,
         imageFromUrl: avatarUrl, // Use what we found
         tags: p.tags || [],
         phones: p.phones || [],
         social_handles: p.social_handles || {},
         handle: p.handle,
         did: p.did
     } as NetworkingAttendee;
  }).filter((a): a is NetworkingAttendee => a !== null);

  // 3. Merge: Real connections come first!
  // Filter out duplicates (if a real connection is also a sample attendee)
  const uniqueSamples = sampleAttendees.filter(s => !networkAttendees.some(n => n.person_id === s.person_id));
  const attendees = [...networkAttendees, ...uniqueSamples];

  const handleNodeClick = async (attendee: NetworkingAttendee) => {
    setSelectedAttendee(attendee);
    setIsModalOpen(true);

    await recordInteractionWithRetry({
      toIdentityId: attendee.person_id,
      type: 'view_profile',
      metadata: { source: 'networking_graph' },
    });
  };

  const handleConnect = async (attendee: NetworkingAttendee) => {
    await recordInteractionWithRetry(
      {
        toIdentityId: attendee.person_id,
        type: 'connection_request',
        metadata: { source: 'attendee_modal', status: 'pending' },
      },
      'Connection sent'
    );

    if (!currentUserId) {
      setIsRegistrationOpen(true);
    }
  };

  const handleSpeakerClick = async (speaker: Speaker) => {
    const speakerId = speaker.id || `speaker_${speaker.name.replace(/\s+/g, '_')}`;

    await recordInteractionWithRetry(
      {
        toIdentityId: speakerId,
        type: 'view_speaker',
        metadata: { source: 'speaker_spotlight' },
      },
      `Saved interest in ${speaker.name}`
    );
  };

  const handleRegister = async (data: { name: string; email: string }) => {
    persistUserProfile(data);
    pushToast({ title: 'Identity claimed', description: 'Syncing your profile...', variant: 'success' });
    await syncRhiz();
  };

  return (
    <div className="w-full bg-white dark:bg-black min-h-screen">
      <HeroSection
        title={config.content.eventName}
        subtitle={config.content.tagline}
        date={config.content.date}
        location={config.content.location}
        backgroundImage={config.backgroundImage}
        primaryAction={{
          label: userProfile ? `Welcome, ${userProfile.name}` : 'Get Tickets',
          onClick: () => (userProfile ? pushToast({ title: 'You are registered', variant: 'info' }) : setIsRegistrationOpen(true)),
        }}
        theme={theme}
      />

      <div className="container mx-auto px-6 -mt-8 relative z-20 mb-12">
        <EventActions 
          eventName={config.content.eventName}
          eventDate={config.content.date}
          eventLocation={config.content.location}
          eventDescription={config.content.tagline}
          className="bg-surface-900/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 max-w-3xl mx-auto"
        />
      </div>

      <SpeakerSpotlight
        speakers={speakers}
        layout="carousel"
        onSpeakerClick={handleSpeakerClick}
      />
      <section className="py-20 bg-neutral-900 border-y border-neutral-800">
        <div className="container mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Event Schedule</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Curated sessions designed to inspire and connect.
          </p>
        </div>
        <ScheduleGrid sessions={sessions} />
      </section>

      {/* Location Section */}
      <section className="py-20 bg-surface-950 border-b border-surface-900">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              <div>
                  <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">The Venue</h2>
                  <p className="text-lg text-surface-400 mb-8 leading-relaxed">
                      We've selected a space that fosters creativity and connection. 
                      Located in the heart of {config.content.location}, accessible by all major transit.
                  </p>
                  <EventActions 
                    eventName={config.content.eventName}
                    eventDate={config.content.date}
                    eventLocation={config.content.location}
                    eventDescription={config.content.tagline}
                  />
              </div>
              <div className="h-[400px]">
                  <MapPreviewCard location={config.content.location} />
              </div>
          </div>
      </section>

      <section className="py-20 bg-black text-white overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif mb-6">Intelligent Networking</h2>
            <p className="text-lg text-neutral-400 mb-8">
              {config.matchmakingConfig.enabled
                ? 'Our AI-powered matchmaking connects you with the right people effortlessly.'
                : 'Connect with like-minded peers in an organic, curated environment.'}
            </p>
            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
            >
              {userProfile ? 'Update Profile' : 'Join the Network'}
            </button>
            {pendingCount > 0 && (
              <div className="mt-3 text-sm text-amber-200 flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-100 px-2 py-0.5 text-xs">
                  {pendingCount} queued
                </span>
                <span className="text-amber-200/80">We’ll sync when connected.</span>
              </div>
            )}
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
              error={graphError}
              onRetry={syncRhiz}
            />
          </div>
        </div>
      </section>

      <AttendeeDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attendee={selectedAttendee}
        onConnect={handleConnect}
      />

      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onRegister={handleRegister}
      />
      
      <EventFooter />
    </div>
  );
}
