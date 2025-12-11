"use client";

import { useState, useCallback } from "react";
import { X, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { scrapeEventUrl } from "@/app/actions/import-event";
import { ScrapedEventData } from "@/lib/types";

interface UrlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (data: ScrapedEventData) => void;
}

export function UrlImportModal({ isOpen, onClose, onImportComplete }: UrlImportModalProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = useCallback(async () => {
     if (!url.trim()) return;
     
     setIsLoading(true);
     setError(null);

     try {
         const data = await scrapeEventUrl(url);
         if (!data || Object.keys(data).length === 0) {
             setError("Could not extract event details. Please check the URL.");
             return;
         }
         
         onImportComplete(data);
         onClose();
         setUrl(""); // Reset
     } catch (e) {
         console.error(e);
         setError("Failed to import. The link might be protected.");
     } finally {
         setIsLoading(false);
     }
  }, [url, onImportComplete, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        {/* Modal Window */}
        <motion.div
           initial={{ scale: 0.95, opacity: 0, y: 10 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           exit={{ scale: 0.95, opacity: 0, y: 10 }}
           className="relative w-full max-w-md bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-brand-400" />
                        Import Event
                    </h3>
                    <p className="text-sm text-surface-400 mt-1">Paste a link from Luma, Eventbrite, or Partiful.</p>
                 </div>
                 <button onClick={onClose} className="text-surface-400 hover:text-white transition-colors">
                     <X size={20} />
                 </button>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://lu.ma/event..."
                        className="w-full bg-surface-950/50 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleImport();
                        }}
                    />
                    
                    {/* Error Toast inside input or below */}
                    {error && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                             <AlertCircle size={18} />
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-xs text-red-400 pl-1">{error}</p>
                )}

                {/* Scraper Status Hints (Optional) */}
                <div className="flex gap-2 justify-center py-2">
                     {/* Icons for supported platforms could go here */}
                </div>

                <button
                    onClick={handleImport}
                    disabled={isLoading || !url}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                    {isLoading ? (
                        <>
                           <span className="w-4 h-4 border-2 border-surface-400 border-t-black rounded-full animate-spin" />
                           <span>Analyzing Metadata...</span>
                        </>
                    ) : (
                        <>
                            <span>Auto-Fill Details</span>
                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </>
                    )}
                </button>
            </div>
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
