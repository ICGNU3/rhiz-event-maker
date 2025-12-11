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
import { EditControls } from '@/components/edit/EditControls';
import { updateEventConfig } from '@/app/actions/events';
import { Pencil } from 'lucide-react';

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

export function EventLandingPage({ config: initialConfig }: EventLandingPageProps) {
  const theme = determineTheme(initialConfig.branding.toneKeywords);
  const { pushToast } = useToast();

  const [config, setConfig] = React.useState(initialConfig);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // ... existing hooks

  const handleUpdateContent = (field: string, value: string) => {
      setConfig(prev => ({
          ...prev,
          content: {
              ...prev.content!,
              [field]: value
          }
      }));
  };

  const handleSave = async () => {
      if (!config.eventId) return;
      setIsSaving(true);
      try {
          const result = await updateEventConfig(config.eventId, { 
              content: config.content 
          });
          
          if (result.success) {
              pushToast({ title: "Changes saved!", variant: "success" });
              setIsEditing(false);
          } else {
              pushToast({ title: "Save failed", description: result.error, variant: "error" });
          }
      } catch (e) {
          pushToast({ title: "Save failed", variant: "error" });
      } finally {
          setIsSaving(false);
      }
  };

  const handleCancel = () => {
      setConfig(initialConfig);
      setIsEditing(false);
  };

  return (
    <div className="w-full bg-white dark:bg-black min-h-screen">
      {/* Edit Toggle for Event Owner (Mocked as always visible since we are in Architect View) */}
      {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="fixed top-24 right-6 z-50 bg-black/50 backdrop-blur-md p-3 rounded-full border border-white/10 hover:bg-black hover:border-brand-500 transition-all group"
            title="Edit Event"
          >
             <Pencil className="w-5 h-5 text-white group-hover:text-brand-400" />
          </button>
      )}

      {isEditing && (
          <EditControls 
             isSaving={isSaving}
             onSave={handleSave}
             onCancel={handleCancel}
          />
      )}

      <HeroSection
        title={config.content!.eventName}
        subtitle={config.content!.tagline}
        date={config.content!.date}
        location={config.content!.location}
        backgroundImage={config.backgroundImage}
        primaryAction={{
          label: userProfile ? `Welcome, ${userProfile.name}` : 'Get Tickets',
          onClick: () => (userProfile ? pushToast({ title: 'You are registered', variant: 'info' }) : setIsRegistrationOpen(true)),
        }}
        theme={theme}
        isEditing={isEditing}
        onUpdate={handleUpdateContent}
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
