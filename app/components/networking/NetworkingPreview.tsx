"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { useState } from "react";
import { EASING, TRANSITIONS } from "./motion-utils";
import { User } from "lucide-react";
import { RelationshipDetail, PersonRead } from "@/lib/protocol-sdk/types";

export interface Attendee extends PersonRead {
  imageFromUrl?: string;
  interests?: string[];
}

export interface NetworkingProps {
  featuredAttendees: Attendee[];
  relationships?: RelationshipDetail[];
  totalCount: number;
  matchmakingEnabled: boolean;
  opportunities?: unknown[]; 
  onNodeClick?: (attendee: Attendee) => void;
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
  onClick,
}: {
  attendee: Attendee | null;
  x: number;
  y: number;
  delayOffset: number;
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
          "bg-gradient-to-b from-white/20 to-white/5",
          "shadow-lg shadow-black/10 group"
      )}>
        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border border-white/5 relative z-10">
            {attendee?.imageFromUrl ? (
                 <img
                 src={attendee.imageFromUrl}
                 alt={attendee.preferred_name || "Attendee"}
                 className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                 onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                 }}
               />
            ) : null}
            
            <div className={clsx(
                "w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs font-medium absolute inset-0",
                attendee?.imageFromUrl ? "-z-10" : "" // Place behind if image exists (fallback logic handled by onError usually, but this is safe)
            )}>
              {attendee ? (
                <span className="text-white/80">{attendee.preferred_name?.[0] || "U"}</span>
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


export default function NetworkingPreview({
  featuredAttendees = [],
  relationships = [],
  totalCount,
  matchmakingEnabled,
  onNodeClick,
}: NetworkingProps) {
  
  // Fill with nulls if not enough attendees to make it look populated
  const [displayAttendees] = useState(() => {
     let list: (Attendee | null)[] = [...featuredAttendees];
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
  const getStrength = (attendee: Attendee | null) => {
    if (!attendee) return 0;
    const rel = relationships.find(r => r.target_person_id === attendee.person_id);
    return rel ? rel.strength_score : 0;
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden bg-zinc-950 rounded-3xl border border-white/5">
      <GradientField />

      {/* Orbit Container handles rotation */}
      <div className="absolute inset-0 flex items-center justify-center">
         {/* Orbit 1 - Inner */}
        <motion.div
           className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full border border-white/[0.03]"
           animate={{ rotate: 360 }}
           transition={TRANSITIONS.orbit(60)}
        >
             {orbit1.map((attendee, i) => {
                 // const radius = 140; 
                 
                 const angle = (i / orbit1.length) * 360;
                 const radian = (angle * Math.PI) / 180;
                 const x = Math.cos(radian) * 140; 
                 const y = Math.sin(radian) * 140; 

                 return (
                   <div key={i} className="absolute top-1/2 left-1/2 w-0 h-0"> {/* Anchor */}
                      <EdgeLine x={x} y={y} strength={getStrength(attendee)} />
                      <AvatarNode
                        attendee={attendee}
                        x={x}
                        y={y}
                        delayOffset={i}
                        onClick={() => attendee && onNodeClick?.(attendee)}
                      />
                   </div>
                 );
             })}
        </motion.div>

         {/* Orbit 2 - Outer */}
         <motion.div
           className="absolute w-[520px] h-[520px] md:w-[720px] md:h-[720px] rounded-full border border-white/[0.03]"
           animate={{ rotate: -360 }}
           transition={TRANSITIONS.orbit(90)}
        >
            {orbit2.map((attendee, i) => {
                 const angle = (i / orbit2.length) * 360;
                 const radian = (angle * Math.PI) / 180;
                 const x = Math.cos(radian) * 260; // radius
                 const y = Math.sin(radian) * 260;
                 
                 return (
                   <div key={i} className="absolute top-1/2 left-1/2 w-0 h-0">
                      <EdgeLine x={x} y={y} strength={getStrength(attendee)} />
                      <AvatarNode
                        attendee={attendee}
                        x={x}
                        y={y}
                        delayOffset={i + orbit1.length}
                        onClick={() => attendee && onNodeClick?.(attendee)}
                      />
                   </div>
                 );
             })}
        </motion.div>

      </div>

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
