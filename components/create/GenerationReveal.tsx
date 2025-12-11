"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function GenerationReveal() {
  const [phase, setPhase] = useState<"intro" | "accelerate" | "implode">("intro");

  useEffect(() => {
    // Phase 1: Intro (Expansion) happens immediately on mount
    
    // Phase 2: Accelerate after 1s
    const t1 = setTimeout(() => setPhase("accelerate"), 1000);
    
    // Phase 3: We don't auto-implode here; we wait for the parent to unmount us.
    // However, if we wanted a "success" trigger, we could pass a prop.
    // For now, let's just loop acceleration until unmount.
    
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
      {/* Deep Space Background */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="absolute inset-0 bg-radial-gradient from-brand-900/50 via-black to-black"
      />

      <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] flex items-center justify-center">
        
        {/* Core - The "Brain" */}
        <motion.div
           className="absolute z-20 w-32 h-32 rounded-full bg-white blur-[50px] mix-blend-screen"
           animate={{ 
              scale: phase === 'accelerate' ? [1, 1.5, 1] : [0, 1],
              opacity: phase === 'accelerate' ? [0.5, 1, 0.5] : [0, 1] 
           }}
           transition={{ duration: phase === 'accelerate' ? 0.5 : 1, repeat: Infinity }}
        />
        <motion.div
           className="absolute z-20 w-4 h-4 rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,1)]"
           animate={{ scale: [1, 1.2, 1] }}
           transition={{ duration: 0.2, repeat: Infinity }}
        />

        {/* Ring 1 - Inner */}
        <motion.div
           className="absolute border border-brand-400/30 rounded-full w-[40%] h-[40%]"
           initial={{ scale: 0, opacity: 0, rotate: 0 }}
           animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: 360 
           }}
           transition={{ 
              scale: { duration: 1, ease: "easeOut" },
              opacity: { duration: 0.5 },
              rotate: { duration: phase === 'accelerate' ? 2 : 10, repeat: Infinity, ease: "linear" }
           }}
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-200 rounded-full shadow-[0_0_10px_#fff]" />
        </motion.div>

        {/* Ring 2 - Middle */}
        <motion.div
           className="absolute border border-purple-500/30 rounded-full w-[70%] h-[70%]"
           initial={{ scale: 0, opacity: 0, rotate: 0 }}
           animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: -360 
           }}
           transition={{ 
              scale: { duration: 1.2, ease: "easeOut", delay: 0.1 },
              opacity: { duration: 0.5, delay: 0.1 },
              rotate: { duration: phase === 'accelerate' ? 3 : 15, repeat: Infinity, ease: "linear" }
           }}
        >
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-300 rounded-full shadow-[0_0_15px_#d8b4fe]" />
        </motion.div>

        {/* Ring 3 - Outer */}
        <motion.div
           className="absolute border border-blue-500/20 rounded-full w-[100%] h-[100%]"
           initial={{ scale: 0, opacity: 0, rotate: 0 }}
           animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: 360 
           }}
           transition={{ 
              scale: { duration: 1.4, ease: "easeOut", delay: 0.2 },
              opacity: { duration: 0.5, delay: 0.2 },
              rotate: { duration: phase === 'accelerate' ? 4 : 20, repeat: Infinity, ease: "linear" }
           }}
        >
           <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_12px_#93c5fd]" />
           <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_12px_#93c5fd]" />
        </motion.div>

        {/* Text */}
        <div className="absolute bottom-[-100px] text-center w-full">
            <motion.h2 
               className="text-2xl md:text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-purple-200 tracking-tighter"
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 1.5, repeat: Infinity }}
            >
               Architecting Experience...
            </motion.h2>
            <motion.p 
               className="text-surface-400 font-mono text-sm mt-2 uppercase tracking-[0.2em]"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
            >
               Analyzing vibe • Connecting nodes
            </motion.p>
        </div>

      </div>
    </div>
  );
}
