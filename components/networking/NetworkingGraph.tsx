"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import clsx from "clsx";
import { useState, useEffect, useMemo } from "react";
import { EASING, TRANSITIONS } from "./motion-utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { RelationshipDetail, OpportunityMatch } from "@/lib/protocol-sdk/types";
import { RelationshipDetail, OpportunityMatch } from "@/lib/protocol-sdk/types";
import { GraphAttendee } from "@/lib/types";
import { MatchmakingCard } from "../event/MatchmakingCard";
import { Attendee } from "@/lib/types"; // Import Attendee specifically for type casting if needed


export interface NetworkingGraphProps {
  featuredAttendees: GraphAttendee[];
  relationships?: RelationshipDetail[];
  totalCount: number;
  matchmakingEnabled: boolean;
  opportunities?: OpportunityMatch[]; 
  onNodeClick?: (attendee: GraphAttendee) => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const GradientField = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Deep Atmospheric Base */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-radial-gradient from-indigo-900/20 via-zinc-950/80 to-zinc-950" />
    
    {/* Moving Orbs */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow mix-blend-screen" />
    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[100px] rounded-full animate-blob mix-blend-screen" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[100px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
    
    {/* Grain Filter for Texture */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

// New Loading State Component
const LoadingState = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
    <div className="relative">
      {/* Ripple Rings */}
      <motion.div 
        className="absolute inset-0 rounded-full border border-blue-500/30"
        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute inset-0 rounded-full border border-blue-500/20"
        animate={{ scale: [1, 3], opacity: [0.3, 0] }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
      />
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-500/20">
         <motion.div 
            className="w-8 h-8 rounded-full border-t-2 border-l-2 border-blue-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
         />
      </div>
    </div>
    <motion.p 
       className="mt-6 text-blue-400 text-sm font-medium tracking-widest uppercase"
       animate={{ opacity: [0.5, 1, 0.5] }}
       transition={{ duration: 2, repeat: Infinity }}
    >
      Analyzing Connections...
    </motion.p>
  </div>
);

const EdgeLine = ({
  x,
  y,
  strength = 0,
}: {
  x: number;
  y: number;
  strength?: number;
}) => {
  if (strength <= 0) return null;

  return (
    <motion.svg
      className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none"
      style={{ x: 0, y: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: strength * 0.6 }}
      transition={{ duration: 1.5, delay: 0.5 }}
    >
      <motion.line
        x1={0}
        y1={0}
        x2={x}
        y2={y}
        stroke="url(#edge-gradient)"
        strokeWidth={1}
        className="opacity-40"
      />
      
      {/* Active Pulse Packet */}
      {strength > 0.5 && (
        <motion.circle r="2" fill="#60A5FA">
            <animateMotion 
               path={`M0,0 L${x},${y}`}
               dur={`${4 - strength * 2}s`} 
               repeatCount="indefinite"
            />
        </motion.circle>
      )}

      <defs>
        <linearGradient id="edge-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={x} y2={y}>
          <stop offset="0%" stopColor="rgba(96, 165, 250, 0)" />
          <stop offset="50%" stopColor="rgba(96, 165, 250, 0.4)" />
          <stop offset="100%" stopColor="rgba(96, 165, 250, 0.1)" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
};

const AvatarNode = ({
  attendee,
  x,
  y,
  delayOffset,
  isMatch = false,
  isMobile = false,
  onClick,
}: {
  attendee: GraphAttendee | null;
  x: number;
  y: number;
  delayOffset: number;
  isMatch?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}) => {
  // Personalized organic motion parameters using stable state
  const [randomValues] = useState(() => ({
    floatDuration: 3.2 + Math.random() * 3.6,
    randomY: (Math.random() - 0.5) * 15
  }));

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      initial={{ x, y: y, opacity: 0, scale: 0 }}
      animate={{
        x,
        y: y + randomValues.randomY,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 1.2,
        delay: delayOffset * 0.05, // Faster stagger
        ease: EASING.living,
        y: {
           duration: randomValues.floatDuration,
           repeat: Infinity,
           repeatType: "reverse",
           ease: "easeInOut"
        }
      }}
    >
      <button 
        onClick={onClick}
        className={clsx(
          "relative group transition-all duration-300",
          isMobile ? "w-8 h-8" : "w-12 h-12"
      )}>
        {/* Ring Glow */}
        <div className={clsx(
            "absolute -inset-2 rounded-full blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100",
            isMatch ? "bg-amber-500/40" : "bg-blue-500/40"
        )} />
        
        {/* Match Ring Animation */}
        {isMatch && (
           <motion.div 
             className="absolute -inset-0.5 rounded-full border border-amber-500/60"
             animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.4, 0.8] }}
             transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
           />
        )}

        {/* Avatar Container: Glass + Border */}
        <div className={clsx(
            "w-full h-full rounded-full overflow-hidden relative z-10 box-border",
            "border border-white/10 backdrop-blur-md shadow-2xl transition-transform duration-300 group-hover:scale-105",
            isMatch ? "ring-1 ring-amber-500/50" : "group-hover:ring-1 group-hover:ring-white/30"
        )}>
            {/* Background for transparency */}
            <div className="absolute inset-0 bg-zinc-900/80" />

            {attendee?.imageFromUrl ? (
                 <Image
                 src={attendee.imageFromUrl}
                 alt={attendee.preferred_name || "Attendee"}
                 fill
                 sizes="(max-width: 768px) 32px, 48px"
                 className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
               />
            ) : null}
            
            <div className={clsx(
                "w-full h-full flex items-center justify-center relative z-20",
                attendee?.imageFromUrl ? "opacity-0" : "text-white/60 text-[10px]" 
            )}>
              {!attendee?.imageFromUrl && (
                  attendee ? (
                    <span className="font-mono">{attendee.preferred_name?.[0] || "?"}</span>
                  ) : <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              )}
            </div>
        </div>
        
        {/* Label on Hover */}
        {attendee && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 z-30">
                {attendee.preferred_name}
            </div>
        )}
      </button>
    </motion.div>
  );
};

// New Error State Component
const GraphErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
      <AlertCircle className="w-8 h-8 text-red-400" />
    </div>
    <h3 className="text-lg font-medium text-white mb-2">Connection Error</h3>
    <p className="text-zinc-400 text-sm mb-6 max-w-xs">
      Unable to load networking graph. This might be a temporary issue.
    </p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-full transition-colors border border-zinc-700"
      >
        <RefreshCw size={14} />
        Retry Connection
      </button>
    )}
  </div>
);

export function NetworkingGraph({
  featuredAttendees = [],
  relationships = [],
  totalCount,
  matchmakingEnabled,
  opportunities = [],
  onNodeClick,
  isLoading = false,
  error,
  onRetry,
}: NetworkingGraphProps) {
  
  // Helper to determine radius based on screen size (simplified for this context)
  // Ideally use a useWindowSize hook, but for now we can use CSS variables or percentages if possible, 
  // or just rely on the container scaling since we have `w-[280px] md:w-[400px]` classes.
  // actually, the `x` and `y` calculations are hardcoded. We need them to be dynamic.
  // Let's use a scale factor based on valid CSS container queries or just generic "small" defaults 
  // and let the parent container scale it down visually via transform if needed.
  // 
  // Better approach: Calculate positions based on 100% and map to pixel values, OR 
  // accept that we are using `absolute` pixels and stick to a "mobile first" radius that looks okay on both or 
  // distinct logic if we had the window size.
  // 
  // Since we don't have a window size hook ready, let's make the container responsive via CSS
  // and the node positions relative to that container size using percentages if possible?
  // Framer motion `x` `y` usually expects pixels.
  //
  // Let's stick to the current pixels for Desktop matching the Design, but scale slightly down for the Mobile view 
  // by checking if window.innerWidth < 768 in a useEffect? 
  // Or just pick a smaller radius that works for both.
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Initial check
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Responsive radii
  const orbit1Radius = isMobile ? 60 : 100;
  const orbit2Radius = isMobile ? 110 : 200; 
  const orbit3Radius = isMobile ? 160 : 300;

  // Increase limit to show more density (was 6/10)
  const maxAttendees = isMobile ? 20 : 50;
  
  // Fill with nulls if not enough attendees to make it look populated
  const displayAttendees = useMemo(() => {
     let list: (GraphAttendee | null)[] = featuredAttendees.slice(0, maxAttendees);
     // If we have very few people, fill up to at least 15 for a good visual
     if (list.length < 15) {
       const needed = 15 - list.length;
       list = [...list, ...Array(needed).fill(null)];
     }
     return list;
  }, [featuredAttendees, maxAttendees]);

  // Distribute across 3 orbits
  // inner: 20%, middle: 35%, outer: 45%
  const count1 = Math.ceil(displayAttendees.length * 0.20);
  const count2 = Math.ceil(displayAttendees.length * 0.35);
  
  const orbit1 = displayAttendees.slice(0, count1);
  const orbit2 = displayAttendees.slice(count1, count1 + count2);
  const orbit3 = displayAttendees.slice(count1 + count2);

  // Helper to find relationship strength for an attendee
  const getStrength = (attendee: GraphAttendee | null) => {
    if (!attendee) return 0;
    const rel = relationships.find(r => r.target_person_id === attendee.person_id);
    return rel ? rel.strength_score : 0;
  };

  const isOpportunity = (attendee: GraphAttendee | null) => {
     if (!attendee) return false;
     return opportunities.some(op => op.candidate.person_id === attendee.person_id);
  };
  return (
    <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden bg-zinc-950 rounded-3xl border border-white/5">
      <GradientField />
      
      {error ? (
        <GraphErrorState onRetry={onRetry} />
      ) : (
        <>
          {isLoading && <LoadingState />}
    
          {/* Orbit Container handles rotation */}
          <motion.div 
             className="absolute inset-0 flex items-center justify-center"
             animate={{ opacity: isLoading ? 0.2 : 1, scale: isLoading ? 0.9 : 1 }}
             transition={{ duration: 0.8 }}
          >
             {/* Orbit 1 - Inner */}
            <motion.div
               className={clsx(
                 "absolute rounded-full border border-white/5",
                 isMobile ? "w-[120px] h-[120px]" : "w-[200px] h-[200px]" // 2 * radius
               )}
               animate={{ rotate: 360 }}
               transition={TRANSITIONS.orbit(60)}
            >
                 {orbit1.map((attendee: GraphAttendee | null, i: number) => {
                     const angle = (i / orbit1.length) * 360;
                 const radian = (angle * Math.PI) / 180;
                 const x = Math.cos(radian) * orbit1Radius; 
                 const y = Math.sin(radian) * orbit1Radius; 

                 return (
                   <div key={i} className="absolute top-1/2 left-1/2 w-0 h-0"> {/* Anchor */}
                      <EdgeLine x={x} y={y} strength={getStrength(attendee)} />
                      <AvatarNode
                        attendee={attendee}
                        x={x}
                        y={y}
                        delayOffset={i}
                        isMatch={isOpportunity(attendee)}
                        isMobile={isMobile}
                        onClick={() => attendee && onNodeClick?.(attendee)}
                      />
                   </div>
                 );
             })}
        </motion.div>

         {/* Orbit 2 - Middle */}
         <motion.div
           className={clsx(
             "absolute rounded-full border border-white/5",
             isMobile ? "w-[220px] h-[220px]" : "w-[400px] h-[400px]" // 2 * radius
           )}
           animate={{ rotate: -360 }}
           transition={TRANSITIONS.orbit(90)}
        >
            {orbit2.map((attendee: GraphAttendee | null, i: number) => {
                 const angle = (i / orbit2.length) * 360;
                 const radian = (angle * Math.PI) / 180;
                 const x = Math.cos(radian) * orbit2Radius; 
                 const y = Math.sin(radian) * orbit2Radius; 
                 
                 return (
                   <div key={i} className="absolute top-1/2 left-1/2 w-0 h-0">
                      <EdgeLine x={x} y={y} strength={getStrength(attendee)} />
                      <AvatarNode
                        attendee={attendee}
                        x={x}
                        y={y}
                        delayOffset={i + orbit1.length}
                        isMatch={isOpportunity(attendee)}
                        isMobile={isMobile}
                        onClick={() => attendee && onNodeClick?.(attendee)}
                      />
                   </div>
                 );
             })}
        </motion.div>

        {/* Orbit 3 - Outer */}
        <motion.div
           className={clsx(
             "absolute rounded-full border border-white/5",
             isMobile ? "w-[320px] h-[320px]" : "w-[600px] h-[600px]" // 2 * radius
           )}
           animate={{ rotate: 360 }}
           transition={TRANSITIONS.orbit(120)}
        >
            {orbit3.map((attendee: GraphAttendee | null, i: number) => {
                 const angle = (i / orbit3.length) * 360;
                 const radian = (angle * Math.PI) / 180;
                 const x = Math.cos(radian) * orbit3Radius; 
                 const y = Math.sin(radian) * orbit3Radius; 
                 
                 return (
                   <div key={i} className="absolute top-1/2 left-1/2 w-0 h-0">
                      <EdgeLine x={x} y={y} strength={getStrength(attendee)} />
                      <AvatarNode
                        attendee={attendee}
                        x={x}
                        y={y}
                        delayOffset={i + orbit1.length + orbit2.length}
                        isMatch={isOpportunity(attendee)}
                        isMobile={isMobile}
                        onClick={() => attendee && onNodeClick?.(attendee)}
                      />
                   </div>
                 );
             })}
        </motion.div>

          {/* Center Node */}
          {!error && (
           <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none w-full max-w-sm px-4">
              {matchmakingEnabled && (
                  <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 1, delay: 0.5 }}
                     className="mb-4 pointer-events-auto"
                  >
                      {/* Show Matchmaking Card if we have an opportunity */}
                      {opportunities.length > 0 && opportunities[0].candidate ? (
                         <div className="text-left w-full">
                            <MatchmakingCard 
                               suggestion={{
                                   targetAttendeeId: opportunities[0].candidate.person_id,
                                   score: opportunities[0].opportunity_score || 0.95,
                                   reasonSummary: opportunities[0].talking_points?.[0] || "High affinity match",
                                   sharedTags: opportunities[0].common_interests || [],
                                   sharedIntents: [],
                                   talkingPoints: opportunities[0].talking_points || []
                               }}
                               targetAttendee={{
                                   // Mapping GraphAttendee(PersonRead) to Attendee
                                   id: opportunities[0].candidate.person_id,
                                   eventId: "temp",
                                   userId: opportunities[0].candidate.person_id,
                                   rhizIdentityId: opportunities[0].candidate.person_id,
                                   name: opportunities[0].candidate.preferred_name,
                                   email: "hidden",
                                   headline: opportunities[0].candidate.bio,
                                   tags: opportunities[0].candidate.interests || [],
                                   intents: []
                               }}
                               onConnect={() => onNodeClick?.(opportunities[0].candidate as unknown as GraphAttendee)}
                            />
                         </div>
                      ) : (
                        <div className="relative px-3 py-1 bg-zinc-900 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                           <motion.div
                               className="w-1.5 h-1.5 rounded-full bg-blue-500"
                               animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                               transition={{ duration: 3, repeat: Infinity }}
                           />
                           <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">AI Match</span>
                        </div>
                      )}
                  </motion.div>
              )}
     
              {/* Only show "Connect with 500+" if NOT showing a card to avoid clutter */}
              {(!matchmakingEnabled || opportunities.length === 0) && (
                <>
                  <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-2">
                     Connect with <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">{totalCount}+</span>
                  </h3>
                  <p className="text-zinc-500 text-sm md:text-base uppercase tracking-widest opacity-60">
                      Attendees
                  </p>
                </>
              )}
           </div>
          )}
        </motion.div>
        </>
      )}

    </div>
  );
}
