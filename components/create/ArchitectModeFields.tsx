import { ScrapedEventData } from "@/lib/types";

import { AssetUpload } from "@/components/create/AssetUpload";
import { TicketTierFields } from "@/components/create/TicketTierFields";

interface ArchitectModeFieldsProps {
  defaultValues?: {
    eventBasics?: string;
    goals?: string;
    audience?: string;
    tone?: string;
    relationshipIntent?: string;
  };
  scrapedData?: ScrapedEventData | null;
  isPending?: boolean;
}

export function ArchitectModeFields({ defaultValues, scrapedData, isPending }: ArchitectModeFieldsProps) {
  return (
    <>
      <div className="space-y-4 group animate-fade-in">
        <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
          01 // Event Essence
        </label>
        <div className="relative">
             <textarea
              name="eventBasics"
              defaultValue={scrapedData?.description ? `${scrapedData.title || ''} - ${scrapedData.description}` : defaultValues?.eventBasics}
              placeholder="Describe your event... e.g. 'A high-energy hackathon in Tokyo for 200 crypto-natives looking to build the future of privacy.'"
              className="w-full bg-surface-950 border-0 border-b-2 border-surface-800 focus:border-brand-500 text-xl md:text-3xl font-light text-white placeholder-surface-700 py-3 md:py-4 px-0 resize-none outline-none transition-all focus:ring-0 min-h-[140px] md:min-h-[160px] leading-tight disabled:opacity-50"
              required
              minLength={20}
              disabled={isPending}
            />
            <p className="text-xs text-surface-600 absolute bottom-2 right-0 pointer-events-none">
              Minimum 20 characters
            </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 animate-fade-in">
         <div className="space-y-4 group">
            <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
              02 // Coordinates
            </label>
            <input
               type="text"
               name="eventLocation"
               defaultValue={scrapedData?.location}
               placeholder="e.g. 123 Innovation Dr, SF"
               className="w-full bg-transparent border-0 border-b border-surface-700 focus:border-brand-500 text-lg md:text-xl text-white placeholder-surface-600 py-3 px-0 outline-none transition-all focus:ring-0"
               required
               disabled={isPending}
            />
         </div>
         <div className="space-y-4 group">
            <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
              03 // Time Sync
            </label>
            <input
               type="datetime-local"
               name="eventDate"
               defaultValue={scrapedData?.date}
               className="w-full bg-transparent border-0 border-b border-surface-700 focus:border-brand-500 text-lg md:text-xl text-white placeholder-surface-600 py-3 px-0 outline-none transition-all focus:ring-0"
               required
               disabled={isPending}
            />
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 animate-fade-in">
        <div className="space-y-4 group">
          <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
            04 // Strategic Goals
          </label>
          <input
            name="goals"
            defaultValue={scrapedData?.goals}
            placeholder="Networking, Dealflow..."
            className="w-full bg-transparent border-0 border-b border-surface-700 focus:border-brand-500 text-lg md:text-xl text-white placeholder-surface-600 py-3 px-0 outline-none transition-all focus:ring-0"
            required
          />
          <p className="text-xs text-surface-500">Comma separated objectives</p>
        </div>

        <div className="space-y-4 group">
          <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
            05 // Audience Profile
          </label>
          <input
            name="audience"
            defaultValue={scrapedData?.audience}
            placeholder="Founders, VCs, Builders..."
            className="w-full bg-transparent border-0 border-b border-surface-700 focus:border-brand-500 text-lg md:text-xl text-white placeholder-surface-600 py-3 px-0 outline-none transition-all focus:ring-0"
          />
        </div>
      </div>

      {/* Vibe & Connection */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 pt-4 animate-fade-in">
        <div className="space-y-3">
          <label className="text-xs font-mono text-surface-500 uppercase tracking-widest">
            Atmosphere
          </label>
          <div className="relative">
            <select
              name="tone"
              defaultValue={scrapedData?.tone?.toLowerCase() || "professional"}
              className="w-full appearance-none bg-surface-800/50 hover:bg-surface-800 text-white rounded-xl px-4 md:px-6 py-3 md:py-4 outline-none border border-surface-700 focus:border-brand-500 transition-all cursor-pointer text-base md:text-lg font-medium"
            >
              <option value="professional">Professional & Crisp</option>
              <option value="vibrant">Vibrant & Electric</option>
              <option value="casual">Casual & Organic</option>
              <option value="luxury">Luxury & Exclusive</option>
            </select>
            <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
              ↓
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono text-surface-500 uppercase tracking-widest">
            Connection Density
          </label>
          <div className="relative">
            <select
              name="relationshipIntent"
              className="w-full appearance-none bg-surface-800/50 hover:bg-surface-800 text-white rounded-xl px-4 md:px-6 py-3 md:py-4 outline-none border border-surface-700 focus:border-brand-500 transition-all cursor-pointer text-base md:text-lg font-medium"
            >
              <option value="high">Active Matchmaking</option>
              <option value="medium">Organic Networking</option>
              <option value="low">Content Focused</option>
            </select>
            <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
              ↓
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-white/5 space-y-4">
             <h3 className="text-sm font-mono text-brand-300 uppercase tracking-widest">
                06 // Brand Assets
             </h3>
                 <AssetUpload 
                    label="Hero Background" 
                    name="background" 
                    description="Main banner image (1920x1080)."
                 />
        </div>

        <div className="pt-8 border-t border-white/5">
             <TicketTierFields />
        </div>
      </div>
    </>
  );
}
