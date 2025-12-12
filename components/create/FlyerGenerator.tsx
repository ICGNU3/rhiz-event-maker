"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Image as ImageIcon } from "lucide-react";

interface FlyerGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  initialPrompt?: string;
}

export function FlyerGenerator({ isOpen, onClose, onSelect, initialPrompt = "" }: FlyerGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    
    // MOCK GENERATION
    setTimeout(() => {
        // Return a placeholder "AI" image
        setGeneratedImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000");
        setIsGenerating(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                AI Flyer Studio
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-surface-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid md:grid-cols-2 gap-8">
               {/* Controls */}
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-mono uppercase text-surface-400 tracking-widest">Prompt</label>
                     <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your flyer... e.g. Minimalist techno poster with neon red accents"
                        className="w-full bg-surface-950 border border-surface-800 rounded-xl p-4 text-white placeholder-surface-600 focus:border-brand-500 outline-none h-32 resize-none"
                     />
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-brand-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                     {isGenerating ? "Dreaming..." : "Generate Flyer"}
                  </button>
               </div>

               {/* Preview */}
               <div className="aspect-[3/4] bg-surface-950 rounded-xl border border-surface-800 flex items-center justify-center overflow-hidden relative group">
                  {isGenerating ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                          <div className="animate-spin text-brand-400 text-2xl">✺</div>
                          <p className="mt-2 text-xs text-brand-200">Processing Pixels...</p>
                      </div>
                  ) : generatedImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={generatedImage} alt="Generated Flyer" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => onSelect(generatedImage)}
                             className="w-full py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-400 transition-colors"
                           >
                             Use this Design
                           </button>
                        </div>
                      </>
                  ) : (
                      <div className="text-center text-surface-600 p-8">
                         <div className="w-16 h-16 bg-surface-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon size={24} />
                         </div>
                         <p className="text-sm">Your masterpiece will appear here</p>
                      </div>
                  )}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
