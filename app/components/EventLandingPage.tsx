'use client';

import React from 'react';
import { EventAppConfig } from "@/lib/baml_client/baml_client/types";
import { HeroSection } from '@/components/hero/HeroSection';
import { SpeakerSpotlight } from './speakers/SpeakerSpotlight';
import { NetworkingPreview } from '@/components/networking/NetworkingPreview';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import type { HeroTheme } from '@/components/hero/theme';

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

  const attendees = config.content.sampleAttendees.map(attendee => ({
    id: attendee.id,
    imageFromUrl: attendee.imageUrl,
    interests: attendee.interests,
    name: attendee.name,
  }));

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
                />
             </div>
          </div>
       </section>
    </div>
  );
}
