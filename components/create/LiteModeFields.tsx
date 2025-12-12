import { useState } from "react";
import { VIBE_PRESETS } from "@/lib/constants";

interface LiteModeFieldsProps {
  defaultValues?: {
    eventName?: string;
    eventDate?: string;
    eventLocation?: string;
    eventBasics?: string;
    // tone is handled via state in this component, might be tricky to prefill without more logic
  };
  isPending?: boolean;
}

export function LiteModeFields({ defaultValues, isPending }: LiteModeFieldsProps) {
  const [selectedVibe, setSelectedVibe] = useState(VIBE_PRESETS[0].id);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* 1. Name */}
      <div className="space-y-3 md:space-y-4 group">
        <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
          Event Name
        </label>
        <div className="space-y-4">
          <input
            name="eventName"
            aria-label="Event Name"
            defaultValue={defaultValues?.eventName}
            placeholder="e.g. Wednesday Night Hoops"
            maxLength={100}
            className="w-full bg-surface-950 border-0 border-b-2 border-surface-800 focus:border-brand-500 text-2xl md:text-3xl font-light text-white placeholder-surface-700 py-2 px-0 outline-none transition-all focus:ring-0"
            required
            disabled={isPending}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="eventDate"
              aria-label="Event Date"
              type="text"
              placeholder="When? e.g. Tomorrow at 7pm"
              defaultValue={defaultValues?.eventDate}
              className="w-full bg-surface-950 border-0 border-b-2 border-surface-800 focus:border-brand-500 text-xl font-light text-white placeholder-surface-700 py-2 px-0 outline-none transition-all focus:ring-0"
              required
              disabled={isPending}
            />

            <input
              name="eventLocation"
              aria-label="Event Location"
              type="text"
              defaultValue={defaultValues?.eventLocation}
              placeholder="e.g. Central Park"
              className="w-full bg-transparent border-0 border-b border-surface-800 focus:border-brand-500 text-lg text-surface-200 placeholder-surface-700 py-2 px-0 outline-none transition-all focus:ring-0"
              required
              disabled={isPending}
           />
        </div>
      </div>
    </div>

      {/* 2. Manual Description (Optional but Magic) */}
      <div className="space-y-2 group">
        <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
          What&apos;s the vibe? (Optional)
        </label>
        <input
          name="eventBasics" // We reuse this field so the backend picks it up
          defaultValue={defaultValues?.eventBasics}
          placeholder="e.g. 'Just a casual hangout for designers'"
          className="w-full bg-transparent border-0 border-b border-surface-800 focus:border-brand-500 text-base md:text-lg text-surface-200 placeholder-surface-600 py-2 px-0 outline-none transition-all focus:ring-0"
        />
      </div>

      {/* 3. Visual Vibe Picker */}
      <div className="space-y-3">
        <label className="text-xs font-mono text-surface-500 uppercase tracking-widest">
          Theme Preset
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VIBE_PRESETS.map((vibe) => (
            <label
              key={vibe.id}
              className={`cursor-pointer relative group flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border transition-all ${
                selectedVibe === vibe.id
                  ? "bg-surface-800 border-brand-500 ring-1 ring-brand-500/50"
                  : "bg-surface-900/50 border-surface-800 hover:bg-surface-800 hover:border-surface-700"
              }`}
            >
              <input
                type="radio"
                name="tone" // Maps to 'tone' in backend
                value={vibe.id}
                checked={selectedVibe === vibe.id}
                onChange={() => setSelectedVibe(vibe.id)}
                className="hidden"
              />
              <vibe.icon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className={`text-xs md:text-sm font-medium ${
                 selectedVibe === vibe.id ? "text-white" : "text-surface-400"
              }`}>
                {vibe.label}
              </span>
              
              {/* Active Gradient Border/Glow */}
              {selectedVibe === vibe.id && (
                  <div className={`absolute inset-0 rounded-xl opacity-10 bg-gradient-to-br ${vibe.color}`} />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Hidden Defaults */}
      <input type="hidden" name="goals" value="Community, Connection" />
      <input type="hidden" name="audience" value="Community" />
      <input type="hidden" name="relationshipIntent" value="medium" />
    </div>
  );
}
