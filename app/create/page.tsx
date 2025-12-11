"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { generateEventConfig } from "../actions/events";
import { ScrapedEventData } from "@/lib/types";
import { ModeSelector } from "@/components/create/ModeSelector";
import { LiteModeFields } from "@/components/create/LiteModeFields";
import { ArchitectModeFields } from "@/components/create/ArchitectModeFields";
import { GenerationError } from "@/components/create/GenerationError";
import { ImageUploader } from "@/components/create/ImageUploader";

export default function CreateEventPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [mode, setMode] = useState<'lite' | 'architect'>('architect');
  const [scrapedData, setScrapedData] = useState<ScrapedEventData | null>(null);

  const handleExtraction = useCallback((data: ScrapedEventData) => {
    console.log("Scraped data:", data);
    setScrapedData(data);
  }, []);

  const handleSubmit = useCallback((formData: FormData) => {
    setError(null);
    setLastFormData(formData); // Save for retry
    
    startTransition(async () => {
      try {
        const result = await generateEventConfig(formData);
        
        if (!result.success || !result.data) {
           const errMsg = result.error || "Unknown error occurred";
           setError(new Error(errMsg));
           return;
        }

        // Redirect to persistent page
        router.push(`/e/${result.data.eventId}`);
        
        setRetryCount(0); 
      } catch (e) {
        console.error("Submission error:", e);
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    });
  }, [router]);

  const handleRetry = useCallback(() => {
    if (lastFormData) {
      setRetryCount(prev => prev + 1);
      handleSubmit(lastFormData);
    }
  }, [lastFormData, handleSubmit]);

  return (
    <div className="min-h-screen bg-surface-950 bg-noise text-foreground font-sans selection:bg-brand-500/30">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-24">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tighter text-white mb-3 md:mb-4">
              Configure Your Event
            </h1>
            <p className="text-surface-400 font-light text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Define the constraints and goals. Our AI engine will generate the entire experience architecture in seconds.
            </p>
        </div>

        {/* Configuration Cockpit - Centered */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          
          <div className="mb-8">
             <ModeSelector mode={mode} onChange={setMode} />
          </div>

          <AnimatePresence mode="wait">
             <motion.div 
               key={mode}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="relative overflow-hidden rounded-3xl border border-white/5 bg-surface-900/40 backdrop-blur-2xl shadow-glass"
             >
                {/* Subtle top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-brand-500/50 to-transparent opacity-50" />

                <div className="p-6 md:p-8 space-y-8 relative z-10">
                   
                   {/* Vision Mode / Image Upload */}
                   {mode === 'architect' && (
                     <div className="mb-8">
                       <ImageUploader onExtractionComplete={handleExtraction} />
                     </div>
                   )}

                   <form action={handleSubmit} className="space-y-6">
                      <input type="hidden" name="type" value={mode} />
                      
                      {mode === 'lite' ? (
                          <LiteModeFields isPending={isPending} />
                      ) : (
                          <ArchitectModeFields 
                            isPending={isPending} 
                            scrapedData={scrapedData}
                          />
                      )}
                      
                      {/* Error Display */}
                      {error && (
                         <GenerationError                             error={error} 
                             onRetry={handleRetry} 
                             isRetrying={isPending}
                             retryCount={retryCount} 
                          /> 
                      )}
                   </form>
                </div>
             </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
