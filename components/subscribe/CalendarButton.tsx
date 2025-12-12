"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";
import { Event } from "@/lib/types";

interface CalendarButtonProps {
  event: Event;
  variant?: "primary" | "secondary" | "outline";
}

/**
 * CalendarButton
 * DIFFERENTIATOR: One-click subscription to the *Org* calendar, not just the event.
 * (For now, implementing Event-level add, but scalable to Series)
 */
export function CalendarButton({ event, variant = "secondary" }: CalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  // const [copied, setCopied] = useState(false);

  // Helper to format dates for Google Calendar
  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatDate(event.startDate)}/${formatDate(event.endDate)}&details=${encodeURIComponent("Join us via EventManage.ai.")}&location=${encodeURIComponent(event.venueType === "virtual" ? "Virtual" : "TBD")}`;

  // const handleCopyLink = () => {
  //   navigator.clipboard.writeText(window.location.href);
  //   setCopied(true);
  //   setTimeout(() => setCopied(false), 2000);
  // };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
           variant === "primary" ? "bg-brand-500 hover:bg-brand-600 text-white" :
           variant === "secondary" ? "bg-surface-800 hover:bg-surface-700 text-white" :
           "border border-surface-600 text-surface-300 hover:text-white"
        }`}
      >
        <Calendar size={16} />
        Add to Calendar
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-surface-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            <a 
              href={googleUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-left px-4 py-3 text-sm text-surface-200 hover:bg-white/5 transition-colors"
            >
              Google Calendar
            </a>
            <button 
               className="block w-full text-left px-4 py-3 text-sm text-surface-200 hover:bg-white/5 transition-colors"
               onClick={() => {
                   // Generate .ics logic would go here
                   alert("Downloading .ics (Mock)");
               }}
            >
               Apple / Outlook (.ics)
            </button>
        </div>
      )}
    </div>
  );
}
