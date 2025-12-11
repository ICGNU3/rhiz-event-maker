"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Loader2, Upload, FileImage, Link as LinkIcon } from "lucide-react";

interface CreateActionBarProps {
  onGenerate: () => void;
  isPending: boolean;
  onOpenScanner: () => void;
  onOpenFlyerCreator: () => void;
  onOpenImport?: () => void;
}

export function CreateActionBar({ 
  onGenerate, 
  isPending, 
  onOpenScanner,
  onOpenFlyerCreator,
  onOpenImport
}: CreateActionBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling a bit or always show if content is long
      // For now, let's fade it in after mount immediately
      setIsVisible(true);
    };
    handleScroll();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 bg-gradient-to-t from-surface-950 via-surface-950/95 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 md:p-4 shadow-2xl flex items-center justify-between gap-4"
        >
          {/* Tools */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenScanner}
              type="button"
              className="p-2.5 rounded-xl hover:bg-white/5 text-surface-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              title="Import from Flyer"
            >
              <Upload size={18} />
              <span className="hidden md:inline">Scan Flyer</span>
            </button>
            <button 
              onClick={onOpenImport}
              type="button"
              className="p-2.5 rounded-xl hover:bg-white/5 text-surface-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              title="Import from URL"
            >
               {/* Link icon imported from lucide-react */}
               <LinkIcon size={18} />
               <span className="hidden md:inline">Import Link</span>
            </button>
            <div className="w-px h-8 bg-white/10 mx-1" />
            <button 
              onClick={onOpenFlyerCreator}
              type="button"
              className="p-2.5 rounded-xl hover:bg-white/5 text-surface-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              title="Create Flyer"
            >
               <FileImage size={18} />
               <span className="hidden md:inline">Create Flyer</span>
            </button>
          </div>

          {/* Primary Action */}
          <button
            onClick={onGenerate}
            disabled={isPending}
            className="flex-1 md:flex-none md:min-w-[200px] bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isPending ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="text-brand-100 group-hover:scale-110 transition-transform" />
                <span>Generate Event</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
