"use client";

import { Calendar, MapPin, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface EventActionsProps {
  eventName: string;
  eventDate: string; // ISO or human readable, we'll try to parse
  eventLocation: string;
  eventDescription?: string;
  className?: string;
}

export function EventActions({  eventName, 
  // eventDate, 
  eventLocation, 
  eventDescription, className = "" }: EventActionsProps) {
  const [copied, setCopied] = useState(false);

  // Helper to construct Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const base = "https://www.google.com/calendar/render?action=TEMPLATE";
    const text = `&text=${encodeURIComponent(eventName)}`;
    // Minimal date parsing, assuming input might be unstructured. 
    // Ideally backend gives us ISO start/end. For now we just pre-fill what we can.
    const details = `&details=${encodeURIComponent(eventDescription || "")}`;
    const location = `&location=${encodeURIComponent(eventLocation)}`;
    
    return `${base}${text}${details}${location}`;
  };

  const getMapsUrl = () => {
    // Universal Google Maps search parameter
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventLocation)}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: eventName,
        text: `Check out this event: ${eventName}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Link
        href={getGoogleCalendarUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-surface-800 hover:bg-surface-700 text-white rounded-xl transition-all border border-white/10 text-sm font-medium group"
      >
        <Calendar className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
        Add to Cal
      </Link>

      <Link
        href={getMapsUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-surface-800 hover:bg-surface-700 text-white rounded-xl transition-all border border-white/10 text-sm font-medium group"
      >
        <MapPin className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
        Get Directions
      </Link>

      <button
        onClick={handleShare}
        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-400 text-black rounded-xl transition-all text-sm font-bold shadow-glow-sm hover:shadow-glow-md group"
      >
        <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        {copied ? "Copied!" : "Share Event"}
      </button>
    </div>
  );
}
