"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { generateEventConfig } from "../actions/events";
import { ScrapedEventData } from "@/lib/types";
import { ModeSelector } from "@/components/create/ModeSelector";
import { LiteModeFields } from "@/components/create/LiteModeFields";
import { ArchitectModeFields } from "@/components/create/ArchitectModeFields";
import { GenerationError } from "@/components/create/GenerationError";
import { ImageUploader } from "@/components/create/ImageUploader";
import { CreateActionBar } from "@/components/create/CreateActionBar";
import { FlyerGenerator } from "@/components/create/FlyerGenerator";
import { UrlImportModal } from "@/components/create/UrlImportModal";
import { GenerationReveal } from "@/components/create/GenerationReveal";

export default function CreateEventPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [mode, setMode] = useState<'lite' | 'architect'>('architect');
  const [scrapedData, setScrapedData] = useState<ScrapedEventData | null>(null);

  // Modal States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFlyerCreatorOpen, setIsFlyerCreatorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleExtraction = useCallback((data: ScrapedEventData) => {
    console.log("Scraped data:", data);
    setScrapedData(data);
    setIsScannerOpen(false); // Close modal on success
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

  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 bg-noise text-foreground font-sans selection:bg-brand-500/30 pb-32">
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

        {/* Configuration Cockpit */}
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
                   
                   <form ref={formRef} action={handleSubmit} className="space-y-6">
                      <input type="hidden" name="type" value={mode} />
                      
                      {mode === 'lite' ? (
                          <LiteModeFields 
                            isPending={isPending} 
                            defaultValues={scrapedData ? {
                                eventName: scrapedData.title,
                                eventBasics: scrapedData.description 
                                   ? scrapedData.description 
                                   : (scrapedData.date && scrapedData.location ? `${scrapedData.date} at ${scrapedData.location}` : undefined)
                            } : undefined}
                          />
                      ) : (
                          <ArchitectModeFields 
                            isPending={isPending} 
                            scrapedData={scrapedData}
                          />
                      )}
                      
                      {/* Error Display */}
                      {error && (
                         <GenerationError                             
                             error={error} 
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

      {/* Sticky Action Bar */}
      <CreateActionBar 
        onGenerate={triggerSubmit}
        isPending={isPending}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenFlyerCreator={() => setIsFlyerCreatorOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
      />

      {/* Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setIsScannerOpen(false)}
                 className="absolute inset-0 bg-black/80 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }} 
                 animate={{ scale: 1, opacity: 1 }} 
                 exit={{ scale: 0.95, opacity: 0 }} 
                 className="relative w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
               >
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-lg font-bold text-white">Scan Event Flyer</h3>
                       <button onClick={() => setIsScannerOpen(false)} className="text-surface-400 hover:text-white">
                           <X size={20} />
                       </button>
                   </div>
                   <ImageUploader onExtractionComplete={handleExtraction} />
               </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <UrlImportModal 
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportComplete={(data) => {
              setScrapedData(data);
              setIsImportOpen(false);
              // Auto-switch to Lite mode if in Architect, or just stay? 
              // User might want to be in Architect mode to see all details.
              // Logic: If user specifically clicked Import, assume they want us to fill things out.
          }}
      />

      {/* Flyer Creator Modal */}
      <FlyerGenerator 
         isOpen={isFlyerCreatorOpen}
         onClose={() => setIsFlyerCreatorOpen(false)}
         onSelect={(imgUrl) => {
             console.log("Selected flyer:", imgUrl);
             setIsFlyerCreatorOpen(false);
             handleExtraction({
                 title: "AI Generated Rave",
                 date: "2024-12-31",
                 location: "Cyber City",
                 description: "An event generated by AI.",
                 tone: "vibrant"
             });
         }}
      />
      
      {/* Cinematic Reveal */}
      <AnimatePresence>
         {isPending && <GenerationReveal />}
      </AnimatePresence>
    </div>
  );
}
