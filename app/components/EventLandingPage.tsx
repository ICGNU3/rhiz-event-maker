import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import React from 'react';
import { EventAppConfig } from '@/lib/types';
import { RelationshipDetail, OpportunityMatch } from '@rhiz/protocol-sdk';
import { HeroSection } from '@/components/hero/HeroSection';
import { SpeakerSpotlight } from './speakers/SpeakerSpotlight';
import { NetworkingGraph } from '@/components/networking/NetworkingGraph';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import type { HeroTheme } from '@/components/hero/theme';
import { rhizClient } from '@/lib/rhizClient';
import type { GraphAttendee } from '@/lib/types';
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
import { CalendarButton } from '@/components/subscribe/CalendarButton';


interface EventLandingPageProps {
  config: EventAppConfig & { eventId?: string };
}


// Removed unused interfaces ContentAttendee and InteractionJob


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
  const { user } = useUser();
  const { userId } = useAuth();
  
  const userProfile = user ? { 
      name: user.fullName || user.firstName || "Guest",
      id: user.id
  } : null;

  // Map speakers to ensure required fields
  const speakers = (config.content?.speakers || []).map(s => ({
      ...s,
      imageUrl: s.imageUrl || "",
      // Ensure other fields match SpeakerCard requirements if needed
  }));
  // Map lib/types Session to SessionCard Session
  const sessions = (config.content?.schedule || []).map(s => {
      // Find primary speaker
      const speakerName = s.speakers?.[0] || "TBD";
      const speakerDetails = speakers.find(sp => sp.name === speakerName);
      
      return {
          id: s.id,
          title: s.title,
          time: `${new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          track: s.track as any, // Cast to match strict union if needed
          description: s.description,
          speaker: {
              name: speakerName,
              avatar: speakerDetails?.imageUrl || "",
              role: speakerDetails?.company || "Speaker"
          },
          isWide: false
      };
  }); 
  const [attendees] = React.useState<GraphAttendee[]>(config.content?.sampleAttendees || []);
  const [relationships, setRelationships] = React.useState<RelationshipDetail[]>([]);
  const [opportunities, setOpportunities] = React.useState<OpportunityMatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [graphError, setGraphError] = React.useState<string | null>(null);
  const [pendingCount] = React.useState(0); // Stubbed for now

  const syncRhiz = React.useCallback(async () => {
      if (!userId || !config.eventId || !config.matchmakingConfig.enabled) return;
      
      setIsLoading(true);
      try {
          // In a real app, we'd fetch the full graph here. 
          // For now, we use sample attendees + any personalized suggestions.
          const [rels, opps] = (typeof rhizClient.getSuggestedConnections === 'function' && typeof rhizClient.getOpportunityMatches === 'function') ? await Promise.all([
             rhizClient.getSuggestedConnections({ 
                  eventId: config.eventId, 
                  identityId: userId 
              }),
              rhizClient.getOpportunityMatches({ 
                  eventId: config.eventId, 
                  identityId: userId 
              })
          ]) : [[], []]; // Handle if method missing
          
          if(Array.isArray(rels)) setRelationships(rels as RelationshipDetail[]);
          if(Array.isArray(opps)) setOpportunities(opps as OpportunityMatch[]);
          setGraphError(null);
      } catch (err) {
          console.error("Rhiz Sync Error:", err);
          setGraphError("Failed to sync network data.");
      } finally {
          setIsLoading(false);
      }
  }, [userId, config.eventId, config.matchmakingConfig.enabled]);

  React.useEffect(() => {
      syncRhiz();
  }, [syncRhiz]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedAttendee, setSelectedAttendee] = React.useState<GraphAttendee | null>(null);

  const handleNodeClick = (node: GraphAttendee) => {
      setSelectedAttendee(node);
      setIsModalOpen(true);
  };

  const handleConnect = async (attendee: GraphAttendee) => { 
      if (!userId || !config.eventId) return;
      
      try {
          await rhizClient.recordInteraction({
              eventId: config.eventId,
              fromIdentityId: userId,
              toIdentityId: attendee.person_id,
              type: "connection_request"
          });
          pushToast({ title: "Connection request sent!", variant: "success" });
          setIsModalOpen(false);
      } catch (e) {
          console.error(e);
          pushToast({ title: "Failed to connect", variant: "error" });
      }
  };

  const [isRegistrationOpen, setIsRegistrationOpen] = React.useState(false);
  
  const handleRegister = async (data: { name: string; email: string }) => { 
      if (!config.eventId) return;
      
      try {
          // Register in Rhiz Protocol
          await rhizClient.ensureIdentity({
              name: data.name,
              email: data.email,
              externalUserId: userId || undefined
          });
          
          pushToast({ title: "Registered successfully!", variant: "success" });
          setIsRegistrationOpen(false);
          // Trigger sync to update graph
          syncRhiz();
      } catch (e) {
          console.error(e);
          pushToast({ title: "Registration failed", variant: "error" });
      }
  };

  const handleSpeakerClick = (speaker: Speaker) => {
      // Optional: show speaker modal
      console.log("Clicked speaker:", speaker);
  };

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
          console.error(e);
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
        title={config.content?.eventName || 'Untitled Event'}
        subtitle={config.content?.tagline || ''}
        date={config.content?.date || ''}
        location={config.content?.location || 'TBD'}
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
          eventName={config.content?.eventName || 'Untitled Event'}
          eventDate={config.content?.date || ''}
          eventLocation={config.content?.location || 'TBD'}
          eventDescription={config.content?.tagline}
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
                      We&apos;ve selected a space that fosters creativity and connection. 
                      Located in the heart of {config.content?.location || 'our selected venue'}, accessible by all major transit.
                  </p>
                  <EventActions 
                    eventName={config.content?.eventName || 'Untitled Event'}
                    eventDate={config.content?.date || ''}
                    eventLocation={config.content?.location || 'TBD'}
                    eventDescription={config.content?.tagline}
                  />
              </div>
              <div className="h-[400px]">
                  <MapPreviewCard location={config.content?.location || 'New York, NY'} />
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
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsRegistrationOpen(true)}
                className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
              >
                {userProfile ? 'Update Profile' : 'Join the Network'}
              </button>
              
              {/* Diff: Calendar Subscription */}
              {config.content && (
                 <CalendarButton 
                   event={{
                       id: config.eventId || "temp",
                       name: config.content.eventName || "Event",
                       startDate: new Date(config.content.date || Date.now()),
                       endDate: new Date(config.content.date || Date.now()), // Assuming 1 day event for now if no end date
                       venueType: "in_person", // Default
                       status: "published",
                       organizationId: "org-1",
                       slug: config.eventId || "slug",
                       timeZone: "UTC"
                   }} 
                   variant="outline"
                 />
              )}
            </div>
            {pendingCount > 0 && (
              <div className="mt-3 text-sm text-amber-200 flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-100 px-2 py-0.5 text-xs">
                  {pendingCount} queued
                </span>
                <span className="text-amber-200/80">We&apos;ll sync when connected.</span>
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
              error={graphError ? new Error(graphError) : null}
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
