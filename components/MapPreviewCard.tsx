"use client";

import { MapPin } from "lucide-react";

interface MapPreviewCardProps {
  location: string;
}

export function MapPreviewCard({ location }: MapPreviewCardProps) {
  // Use a generic placeholder if we don't have a real map API key for static images yet.
  // In a real 10/10 app we'd use Mapbox or Google Static Maps. 
  // For now, we'll create a beautiful "Schematic" abstract map style using CSS/SVG patterns that looks "Architect" themed.
  
  return (
    <div className="relative w-full h-[300px] md:h-full min-h-[300px] bg-surface-900 rounded-3xl overflow-hidden border border-surface-800 shadow-2xl group">
      {/* Abstract Map Pattern Background */}
      <div className="absolute inset-0 opacity-20" 
           style={{ 
               backgroundImage: `radial-gradient(circle at 2px 2px, #525252 1px, transparent 0)`,
               backgroundSize: '24px 24px' 
           }} 
      />
      
      {/* "Street" Lines */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-700/50 transform -rotate-12" />
      <div className="absolute top-0 left-1/3 h-full w-[2px] bg-surface-700/50 transform rotate-12" />
      
      {/* Pin */}
      <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
         <div className="relative">
            <div className="absolute inset-0 bg-brand-500 rounded-full blur-lg opacity-50 animate-pulse-slow" />
            <div className="relative z-10 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-glow-md">
                <MapPin className="w-5 h-5 text-black" />
            </div>
         </div>
         <div className="bg-surface-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl">
            <span className="text-xs font-mono text-brand-200">{location}</span>
         </div>
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-surface-950 via-transparent to-transparent opacity-80" />
      
      <div className="absolute bottom-6 left-6 right-6">
          <p className="text-surface-500 text-xs uppercase tracking-widest font-mono mb-2">Venue Location</p>
          <h3 className="text-xl text-white font-heading font-semibold">{location}</h3>
      </div>
    </div>
  );
}
