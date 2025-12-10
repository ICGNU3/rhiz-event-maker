"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";

// Simplified Avatar Node for Hero
const HeroAvatar = ({ delay, x, y, size = "md" }: { delay: number; x: number; y: number; size?: "sm" | "md" }) => {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      initial={{ x, y, scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: y + 10 // Float effect managed by parent or here? Let's just do static orbit here
      }}
      transition={{ delay: delay * 0.1, duration: 0.8 }}
    >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
          className={clsx(
              "rounded-full border border-white/20 backdrop-blur-md shadow-xl flex items-center justify-center overflow-hidden bg-black/40",
              size === "md" ? "w-10 h-10" : "w-6 h-6"
          )}
        >
             <div className="w-full h-full bg-gradient-to-tr from-brand-500/20 to-purple-500/20" />
             <div className="absolute text-[8px] text-white/50 font-mono">{String.fromCharCode(65 + Math.floor(Math.random() * 26))}</div>
        </motion.div>
    </motion.div>
  );
};

export function HeroGraph() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950/80 to-zinc-950" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full animate-pulse-slow" />
        
        {/* Central Hub */}
        <div className="relative z-10 w-24 h-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-brand-500/20">
             <div className="absolute inset-0 rounded-full border border-brand-500/30 animate-ping-slow opacity-20" />
             <div className="text-white font-heading font-bold text-xl tracking-tight">CI</div>
        </div>

        {/* Orbit Inner */}
        <motion.div 
            className="absolute border border-white/5 rounded-full w-[200px] h-[200px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
             {[0, 90, 180, 270].map((deg, i) => {
                 const rad = deg * (Math.PI / 180);
                 const x = Math.cos(rad) * 100;
                 const y = Math.sin(rad) * 100;
                 return <HeroAvatar key={i} delay={i} x={x} y={y} size="sm" />;
             })}
        </motion.div>

        {/* Orbit Outer */}
        <motion.div 
            className="absolute border border-white/5 rounded-full w-[350px] h-[350px]"
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
             {[45, 135, 225, 315].map((deg, i) => {
                 const rad = deg * (Math.PI / 180);
                 const x = Math.cos(rad) * 175;
                 const y = Math.sin(rad) * 175;
                 return <HeroAvatar key={i} delay={i+4} x={x} y={y} size="md" />;
             })}
        </motion.div>
        
        {/* Connection Lines (Static for simplicity in hero) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
             <circle cx="50%" cy="50%" r="100" stroke="#38BDF8" strokeWidth="1" fill="none" strokeDasharray="4 4" />
             <circle cx="50%" cy="50%" r="175" stroke="#A855F7" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        </svg>

    </div>
  );
}
