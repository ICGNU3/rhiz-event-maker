"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { EASING, TRANSITIONS } from "./motion-utils";
import { User } from "lucide-react";
import { RelationshipDetail, OpportunityMatch } from "@/lib/protocol-sdk/types";
import { GraphAttendee } from "@/lib/types";

export interface NetworkingGraphProps {
  featuredAttendees: GraphAttendee[];
  relationships?: RelationshipDetail[];
  totalCount: number;
  matchmakingEnabled: boolean;
  opportunities?: OpportunityMatch[]; 
  onNodeClick?: (attendee: GraphAttendee) => void;
  isLoading?: boolean;
}

const GradientField = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/5 to-transparent blur-3xl opacity-40 animate-pulse-slow" />
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
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
      style={{ x: 0, y: 0 }} // Center anchor
      initial={{ opacity: 0 }}
      animate={{ opacity: strength * 0.8 }} // Max opacity 0.8 based on strength
      transition={{ duration: 1.5, delay: 0.5 }}
    >
      <line
        x1={0}
        y1={0}
        x2={x}
        y2={y}
        stroke="url(#edge-gradient)"
        strokeWidth={1 + strength * 2} // Thicker for stronger ties
        strokeDasharray="4 4"
        className="opacity-60"
      />
      <defs>
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" /> {/* Blue tint */}
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
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
  onClick,
}: {
  attendee: GraphAttendee | null;
  x: number;
  y: number;
  delayOffset: number;
  isMatch?: boolean;
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
        delay: delayOffset * 0.1,
        ease: EASING.living,
        y: {
           duration: randomValues.floatDuration,
           repeat: Infinity,
           repeatType: "reverse",
           ease: "easeInOut"
        }
      }}
    >
      {/* Node Frame */}
      <button 
        onClick={onClick}
        className={clsx(
          "relative w-10 h-10 md:w-14 md:h-14 rounded-full p-[1px] transition-transform duration-300 hover:scale-110 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50",
          isMatch ? "bg-gradient-to-b from-amber-400 to-amber-600 shadow-amber-500/50" : "bg-gradient-to-b from-white/20 to-white/5",
          "shadow-lg shadow-black/10 group"
      )}>
        {isMatch && (
           <motion.div 
             className="absolute -inset-1 rounded-full border border-amber-500/50 opacity-70"
             animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
             transition={{ duration: 2, repeat: Infinity }}
           />
        )}
        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border border-white/5 relative z-10">
            {attendee?.imageFromUrl ? (
                 <Image
                 src={attendee.imageFromUrl}
                 alt={attendee.preferred_name || "Attendee"}
                 width={56}
                 height={56}
                 className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
               />
            ) : null}
            
            <div className={clsx(
                "w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs font-medium absolute inset-0",
                attendee?.imageFromUrl ? "-z-10" : "" 
            )}>
              {attendee ? (
                <span className="text-white/80">
                  {attendee.handle ? `@${attendee.handle[0]}` : (attendee.preferred_name?.[0] || "U")}
                </span>
              ) : (
                <User size={14} className="opacity-50" />
              )}
            </div>
        </div>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </button>
    </motion.div>
  );
};

export function NetworkingGraph({
  featuredAttendees = [],
  relationships = [],
  totalCount,
  matchmakingEnabled,
  opportunities = [],
  onNodeClick,
  isLoading = false,
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
  
  // Simple check for mobile on mount
  // Note: hydration mismatch possible if we render different things based on this, 
  // so we start false and update.
  if (typeof window !== 'undefined') {
      // safe to check? no, still useEffect better.
  }

  // Update radius based on screen size
  const orbit1Radius = isMobile ? 100 : 140;
  const orbit2Radius = isMobile ? 180 : 260;

  // Use ResizeObserver for robustness or simple event listener
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    // Initial check
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fill with nulls if not enough attendees to make it look populated
  const [displayAttendees] = useState(() => {
     let list: (GraphAttendee | null)[] = [...featuredAttendees];
     if (list.length < 8) {
       const needed = 8 - list.length;
       list = [...list, ...Array(needed).fill(null)];
     }
     return list;
  });

  // Split into 2 orbits
  const orbit1Count = Math.ceil(displayAttendees.length * 0.4); // ~40% inner
  const orbit1 = displayAttendees.slice(0, orbit1Count);
  const orbit2 = displayAttendees.slice(orbit1Count);

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
      
      {isLoading && <LoadingState />}

      {/* Orbit Container handles rotation */}
      <motion.div 
         className="absolute inset-0 flex items-center justify-center"
         animate={{ opacity: isLoading ? 0.2 : 1, scale: isLoading ? 0.9 : 1 }}
         transition={{ duration: 0.8 }}
      >
         {/* Orbit 1 - Inner */}
        <motion.div
           className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full border border-white/5"
           animate={{ rotate: 360 }}
           transition={TRANSITIONS.orbit(60)}
        >
             {orbit1.map((attendee, i) => {
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
                        onClick={() => attendee && onNodeClick?.(attendee)}
                      />
                   </div>
                 );
             })}
        </motion.div>

         {/* Orbit 2 - Outer */}
         <motion.div
           className="absolute w-[360px] h-[360px] md:w-[720px] md:h-[720px] rounded-full border border-white/5"
           animate={{ rotate: -360 }}
           transition={TRANSITIONS.orbit(90)}
        >
            {orbit2.map((attendee, i) => {
                 const angle = (i / orbit2.length) * 360;
                 const radian = (angle * Math.PI) / 180;
                 const x = Math.cos(radian) * orbit2Radius; // radius
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
                        onClick={() => attendee && onNodeClick?.(attendee)}
                      />
                   </div>
                 );
             })}
        </motion.div>

      </motion.div>

      {/* Center Node */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none">
         {matchmakingEnabled && (
             <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mb-4 pointer-events-auto"
             >
                 <div className="relative px-3 py-1 bg-zinc-900 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">AI Match</span>
                 </div>
             </motion.div>
         )}

         <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-2">
            Connect with <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">{totalCount}+</span>
         </h3>
         <p className="text-zinc-500 text-sm md:text-base uppercase tracking-widest opacity-60">
             Attendees
         </p>
      </div>

    </div>
  );
}
