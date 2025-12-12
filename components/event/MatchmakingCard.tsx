"use client";

import { ConnectionSuggestion, Attendee } from "@/lib/types";
// import { Sparkles, MessageCircle, ArrowRight, ThumbsDown, ThumbsUp } from "lucide-react";
import { Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface MatchmakingCardProps {
  suggestion: ConnectionSuggestion;
  targetAttendee: Attendee;
  onConnect?: () => void;
}

export function MatchmakingCard({ suggestion, targetAttendee, onConnect }: MatchmakingCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl bg-surface-900/50 border border-white/5 p-5 hover:border-brand-500/30 transition-colors"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center overflow-hidden">
             {/* Fallback avatar if no image */}
             <span className="text-lg font-bold text-surface-400">
               {targetAttendee.name.charAt(0)}
             </span>
          </div>
          {/* Match Score Badge */}
          <div className="mt-2 flex justify-center">
             <div className="px-2 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-[10px] font-mono text-brand-300 flex items-center gap-1">
                <Sparkles size={10} />
                {Math.round(suggestion.score * 100)}%
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-medium text-white text-lg leading-tight">{targetAttendee.name}</h3>
            <p className="text-sm text-surface-400">{targetAttendee.headline || targetAttendee.company}</p>
          </div>

          {/* AI Reason */}
          <div className="p-3 rounded-xl bg-surface-950/50 border border-white/5 space-y-2">
             <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <p className="text-sm text-surface-200 leading-snug">
                  {suggestion.reasonSummary}
                </p>
             </div>
             
             {/* Talking Points */}
             {suggestion.talkingPoints.length > 0 && (
               <div className="pl-6 space-y-1">
                 {suggestion.talkingPoints.slice(0, 2).map((point, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-surface-400">
                      <div className="w-1 h-1 rounded-full bg-surface-600" />
                      {point}
                    </div>
                 ))}
               </div>
             )}
          </div>

          {/* Shared Tags */}
          <div className="flex flex-wrap gap-1.5">
             {suggestion.sharedTags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-surface-300">
                   #{tag}
                </span>
             ))}
          </div>

          {/* Action */}
          <button 
             onClick={onConnect}
             className="w-full mt-2 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
          >
             <MessageCircle size={14} />
             Request Intro
          </button>
        </div>
      </div>
    </motion.div>
  );
}
