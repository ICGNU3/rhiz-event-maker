"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import clsx from "clsx";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { EASING, TRANSITIONS } from "./motion-utils";
import { GRAPH_CONFIG } from "./graph.config";
import { AlertCircle, RefreshCw } from "lucide-react";
import { RelationshipDetail, OpportunityMatch } from "@/lib/protocol-sdk/types";

import { GraphAttendee } from "@/lib/types";
import { MatchmakingCard } from "../event/MatchmakingCard";

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

// ============================================================================
// Sub-components
// ============================================================================

const GradientField = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-radial-gradient from-indigo-900/20 via-zinc-950/80 to-zinc-950" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow mix-blend-screen" />
    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-600/5 blur-[100px] rounded-full animate-blob mix-blend-screen" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[100px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

const LoadingState = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-20" role="status" aria-label="Loading network graph">
    <div className="relative">
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
  if (strength <= GRAPH_CONFIG.edges.minStrength) return null;

  return (
    <motion.svg
      className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none"
      style={{ x: 0, y: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: strength * 0.6 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      aria-hidden="true"
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
      
      {strength > GRAPH_CONFIG.edges.pulseThreshold && (
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

interface AvatarNodeProps {
  attendee: GraphAttendee | null;
  x: number;
  y: number;
  delayOffset: number;
  isMatch?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
  tabIndex?: number;
}

const AvatarNode = ({
  attendee,
  x,
  y,
  delayOffset,
  isMatch = false,
  isMobile = false,
  onClick,
  tabIndex = 0,
}: AvatarNodeProps) => {
  const [randomValues] = useState(() => ({
    floatDuration: GRAPH_CONFIG.animation.floatDuration[0] + Math.random() * (GRAPH_CONFIG.animation.floatDuration[1] - GRAPH_CONFIG.animation.floatDuration[0]),
    randomY: (Math.random() - 0.5) * 15
  }));

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }, [onClick]);

  const nodeSize = isMobile ? GRAPH_CONFIG.mobile.nodeSize : GRAPH_CONFIG.desktop.nodeSize;

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
        duration: GRAPH_CONFIG.animation.entryDuration,
        delay: delayOffset * GRAPH_CONFIG.animation.staggerDelay,
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
        onKeyDown={handleKeyDown}
        tabIndex={attendee ? tabIndex : -1}
        aria-label={attendee ? `View profile for ${attendee.preferred_name}` : undefined}
        className={clsx(
          "relative group transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-full",
          isMobile ? "w-8 h-8" : "w-12 h-12"
      )}>
        {/* Ring Glow */}
        <div className={clsx(
            "absolute -inset-2 rounded-full blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
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

        {/* Avatar Container */}
        <div className={clsx(
            "w-full h-full rounded-full overflow-hidden relative z-10 box-border",
            "border border-white/10 backdrop-blur-md shadow-2xl transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105",
            isMatch ? "ring-1 ring-amber-500/50" : "group-hover:ring-1 group-hover:ring-white/30 group-focus-visible:ring-1 group-focus-visible:ring-white/30"
        )}>
            <div className="absolute inset-0 bg-zinc-900/80" />

            {attendee?.imageFromUrl ? (
                 <Image
                 src={attendee.imageFromUrl}
                 alt={attendee.preferred_name || "Attendee"}
                 fill
                 sizes={`${nodeSize}px`}
                 className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
               />
            ) : null}
            
            <div className={clsx(
                "w-full h-full flex items-center justify-center relative z-20",
                attendee?.imageFromUrl ? "opacity-0" : "text-white/60 text-xs" 
            )}>
              {!attendee?.imageFromUrl && (
                  attendee ? (
                    <span className="font-mono">{attendee.preferred_name?.[0] || "?"}</span>
                  ) : <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              )}
            </div>
        </div>
        
        {/* Label on Hover/Focus */}
        {attendee && (
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/90 backdrop-blur-md rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none border border-white/10 z-30"
              role="tooltip"
            >
                {attendee.preferred_name}
            </div>
        )}
      </button>
    </motion.div>
  );
};

const GraphErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4" role="alert">
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
      <AlertCircle className="w-8 h-8 text-red-400" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-medium text-white mb-2">Connection Error</h3>
    <p className="text-zinc-400 text-sm mb-6 max-w-xs">
      Unable to load networking graph. This might be a temporary issue.
    </p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-full transition-colors border border-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <RefreshCw size={14} aria-hidden="true" />
        Retry Connection
      </button>
    )}
  </div>
);

// ============================================================================
// Custom Hook for Responsive Handling
// ============================================================================

function useResponsiveGraph() {
  const [isMobile, setIsMobile] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < GRAPH_CONFIG.mobileBreakpoint);
    };
    
    const debouncedCheck = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(checkMobile, 100);
    };

    checkMobile(); // Initial check
    window.addEventListener('resize', debouncedCheck);
    
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const config = isMobile ? GRAPH_CONFIG.mobile : GRAPH_CONFIG.desktop;
  
  return { isMobile, config };
}

// ============================================================================
// Pre-calculated Node Data Type
// ============================================================================

interface OrbitNode {
  attendee: GraphAttendee | null;
  x: number;
  y: number;
  strength: number;
  isOpportunity: boolean;
  key: string;
}

// ============================================================================
// Main Component
// ============================================================================

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
  
  const { isMobile, config } = useResponsiveGraph();

  // Pre-compute strength lookup map for O(1) access
  const strengthMap = useMemo(() => {
    const map = new Map<string, number>();
    relationships.forEach(r => {
      map.set(r.target_person_id, r.strength_score);
    });
    return map;
  }, [relationships]);

  // Pre-compute opportunity set for O(1) lookup
  const opportunitySet = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach(op => {
      if (op.candidate?.person_id) {
        set.add(op.candidate.person_id);
      }
    });
    return set;
  }, [opportunities]);

  // Prepare display attendees with null padding
  const displayAttendees = useMemo(() => {
    let list: (GraphAttendee | null)[] = featuredAttendees.slice(0, config.maxNodes);
    if (list.length < GRAPH_CONFIG.minNodes) {
      const needed = GRAPH_CONFIG.minNodes - list.length;
      list = [...list, ...Array(needed).fill(null)];
    }
    return list;
  }, [featuredAttendees, config.maxNodes]);

  // Pre-calculate all orbit nodes with their positions and properties
  const { orbit1Nodes, orbit2Nodes, orbit3Nodes } = useMemo(() => {
    const [orbit1Ratio, orbit2Ratio] = GRAPH_CONFIG.orbitDistribution;
    const [radius1, radius2, radius3] = config.orbits;
    
    const count1 = Math.ceil(displayAttendees.length * orbit1Ratio);
    const count2 = Math.ceil(displayAttendees.length * orbit2Ratio);
    
    const orbit1 = displayAttendees.slice(0, count1);
    const orbit2 = displayAttendees.slice(count1, count1 + count2);
    const orbit3 = displayAttendees.slice(count1 + count2);

    const calculateNodes = (
      attendees: (GraphAttendee | null)[],
      radius: number,
      indexOffset: number
    ): OrbitNode[] => {
      return attendees.map((attendee, i) => {
        const angle = (i / attendees.length) * 360;
        const radian = (angle * Math.PI) / 180;
        const x = Math.cos(radian) * radius;
        const y = Math.sin(radian) * radius;
        const personId = attendee?.person_id;
        
        return {
          attendee,
          x,
          y,
          strength: personId ? (strengthMap.get(personId) ?? 0) : 0,
          isOpportunity: personId ? opportunitySet.has(personId) : false,
          key: personId || `placeholder-${indexOffset + i}`,
        };
      });
    };

    return {
      orbit1Nodes: calculateNodes(orbit1, radius1, 0),
      orbit2Nodes: calculateNodes(orbit2, radius2, count1),
      orbit3Nodes: calculateNodes(orbit3, radius3, count1 + count2),
    };
  }, [displayAttendees, config.orbits, strengthMap, opportunitySet]);

  // Compute orbit visual sizes for CSS
  const orbitSizes = useMemo(() => ({
    orbit1: config.orbits[0] * 2,
    orbit2: config.orbits[1] * 2,
    orbit3: config.orbits[2] * 2,
  }), [config.orbits]);

  const [orbitSpeed1, orbitSpeed2, orbitSpeed3] = GRAPH_CONFIG.animation.orbitSpeeds;

  return (
    <div 
      className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden bg-zinc-950 rounded-3xl border border-white/5"
      role="region"
      aria-label="Interactive Networking Graph"
      aria-busy={isLoading}
    >
      <GradientField />
      
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        {isLoading && "Loading network connections..."}
        {error && "Failed to load network graph."}
        {!isLoading && !error && `Showing ${displayAttendees.filter(Boolean).length} attendees in the network.`}
      </div>
      
      {error ? (
        <GraphErrorState onRetry={onRetry} />
      ) : (
        <>
          {isLoading && <LoadingState />}
    
          <motion.div 
             className="absolute inset-0 flex items-center justify-center"
             animate={{ opacity: isLoading ? 0.2 : 1, scale: isLoading ? 0.9 : 1 }}
             transition={{ duration: 0.8 }}
          >
             {/* Orbit 1 - Inner */}
            <motion.div
               className="absolute rounded-full border border-white/5"
               style={{ width: orbitSizes.orbit1, height: orbitSizes.orbit1 }}
               animate={{ rotate: 360 }}
               transition={TRANSITIONS.orbit(orbitSpeed1)}
            >
                 {orbit1Nodes.map((node, i) => (
                   <div key={node.key} className="absolute top-1/2 left-1/2 w-0 h-0">
                      <EdgeLine x={node.x} y={node.y} strength={node.strength} />
                      <AvatarNode
                        attendee={node.attendee}
                        x={node.x}
                        y={node.y}
                        delayOffset={i}
                        isMatch={node.isOpportunity}
                        isMobile={isMobile}
                        tabIndex={i + 1}
                        onClick={() => node.attendee && onNodeClick?.(node.attendee)}
                      />
                   </div>
                 ))}
            </motion.div>

            {/* Orbit 2 - Middle */}
            <motion.div
              className="absolute rounded-full border border-white/5"
              style={{ width: orbitSizes.orbit2, height: orbitSizes.orbit2 }}
              animate={{ rotate: -360 }}
              transition={TRANSITIONS.orbit(orbitSpeed2)}
            >
                {orbit2Nodes.map((node, i) => (
                   <div key={node.key} className="absolute top-1/2 left-1/2 w-0 h-0">
                      <EdgeLine x={node.x} y={node.y} strength={node.strength} />
                      <AvatarNode
                        attendee={node.attendee}
                        x={node.x}
                        y={node.y}
                        delayOffset={i + orbit1Nodes.length}
                        isMatch={node.isOpportunity}
                        isMobile={isMobile}
                        tabIndex={i + orbit1Nodes.length + 1}
                        onClick={() => node.attendee && onNodeClick?.(node.attendee)}
                      />
                   </div>
                 ))}
            </motion.div>

            {/* Orbit 3 - Outer */}
            <motion.div
               className="absolute rounded-full border border-white/5"
               style={{ width: orbitSizes.orbit3, height: orbitSizes.orbit3 }}
               animate={{ rotate: 360 }}
               transition={TRANSITIONS.orbit(orbitSpeed3)}
            >
                {orbit3Nodes.map((node, i) => (
                   <div key={node.key} className="absolute top-1/2 left-1/2 w-0 h-0">
                      <EdgeLine x={node.x} y={node.y} strength={node.strength} />
                      <AvatarNode
                        attendee={node.attendee}
                        x={node.x}
                        y={node.y}
                        delayOffset={i + orbit1Nodes.length + orbit2Nodes.length}
                        isMatch={node.isOpportunity}
                        isMobile={isMobile}
                        tabIndex={i + orbit1Nodes.length + orbit2Nodes.length + 1}
                        onClick={() => node.attendee && onNodeClick?.(node.attendee)}
                      />
                   </div>
                 ))}
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
                        {opportunities.length > 0 && opportunities[0].candidate ? (
                           <div className="text-left w-full">
                              <MatchmakingCard 
                                 suggestion={{
                                     targetAttendeeId: opportunities[0].candidate.person_id,
                                     score: opportunities[0].suggestion.match_score || 0.95,
                                     reasonSummary: opportunities[0].suggestion.reasons?.[0] || "High affinity match",
                                     sharedTags: opportunities[0].candidate.tags || [],
                                     sharedIntents: [],
                                     talkingPoints: opportunities[0].suggestion.reasons || []
                                 }}
                                 targetAttendee={{
                                     id: opportunities[0].candidate.person_id,
                                     eventId: "temp",
                                     userId: opportunities[0].candidate.person_id,
                                     rhizIdentityId: opportunities[0].candidate.person_id,
                                     name: opportunities[0].candidate.preferred_name || "Anonymous",
                                     email: "hidden",
                                     headline: opportunities[0].candidate.headline || opportunities[0].candidate.bio_summary || "",
                                     tags: opportunities[0].candidate.tags || [],
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
                             <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">AI Match</span>
                          </div>
                        )}
                    </motion.div>
                )}
      
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
