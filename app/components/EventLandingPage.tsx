'use client';

import React from 'react';
import { EventAppConfig } from '@/lib/baml_client/baml_client/types';
import { RelationshipDetail, OpportunityMatch } from '@/lib/protocol-sdk/types';
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

  const [relationships, setRelationships] = React.useState<RelationshipDetail[]>([]);
  const [opportunities, setOpportunities] = React.useState<OpportunityMatch[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [selectedAttendee, setSelectedAttendee] = React.useState<NetworkingAttendee | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [graphError, setGraphError] = React.useState<Error | null>(null);
  const [userProfile, setUserProfile] = React.useState<{ name: string; email: string } | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = React.useState(false);

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

  const speakers = config.content.speakers.map((speaker, idx) => {
    const fallbackId = `speaker_${idx}_${speaker.name.replace(/\s+/g, '_')}`;
    return {
      id: (speaker as any).id || fallbackId,
      name: speaker.name,
      role: speaker.role,
      company: speaker.company,
      imageUrl: speaker.imageUrl,
      bio: speaker.bio,
      handle: (speaker as any).handle,
      did: (speaker as any).did,
    } as Speaker;
  });

  const sessions = config.content.schedule.map((session) => ({
    id: session.id,
    time: session.time,
    title: session.title,
    speaker: {
      name: session.speakerName,
      avatar: speakers.find((s) => s.name === session.speakerName)?.imageUrl || '',
      role: session.speakerRole,
    },
    track: session.track as 'Main Stage' | 'Workshop' | 'Networking',
    isWide: session.isWide,
  }));

  const attendees: NetworkingAttendee[] = config.content.sampleAttendees.map((attendee, i) => {
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
        primaryAction={{
          label: userProfile ? `Welcome, ${userProfile.name}` : 'Get Tickets',
          onClick: () => (userProfile ? pushToast({ title: 'You are registered', variant: 'info' }) : setIsRegistrationOpen(true)),
        }}
        theme={theme}
      />

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
    </div>
  );
}
