"use client";

import { useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue, Easing, TargetAndTransition } from "framer-motion";
import { HeroGraph } from "./HeroGraph";
import { TrendingUp, UserPlus } from "lucide-react";

export function FloatingHeroComposition() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position state
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for the tilt
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };


  // Reusable floating animation for elements
  const floatAnim = (delay: number): TargetAndTransition => ({
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    },
  });

  return (
    <div
      className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center perspective-[1200px]"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <motion.div
        className="relative w-[340px] md:w-[600px] aspect-[4/3] preserve-3d"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* CENTERPIECE: Live Graph Dashboard */}
        <motion.div
            className="absolute inset-0 z-10 bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ 
                transform: "translateZ(0px)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
        >
             {/* Header UI Mock */}
             <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2 z-20">
                 <div className="w-3 h-3 rounded-full bg-red-500/50" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                 <div className="w-3 h-3 rounded-full bg-green-500/50" />
             </div>
             {/* Live Graph Component */}
             <div className="absolute inset-0 pt-10 bg-zinc-950">
                 <HeroGraph />
             </div>
        </motion.div>

        {/* FLOATING ELEMENT 1: Match Card (Top Right) */}
        <motion.div
          animate={floatAnim(0)}
          className="absolute -top-8 -right-[10%] md:-right-16 w-52 md:w-64 z-50 p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl flex items-center gap-4"
          style={{ transform: "translateZ(60px)" }}
        >
           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center shrink-0">
               <UserPlus className="text-white w-5 h-5" />
           </div>
           <div>
               <div className="text-xs text-brand-300 font-mono mb-0.5">MATCH FOUND</div>
               <div className="text-sm font-medium text-white">Sarah x David</div>
               <div className="text-[10px] text-zinc-400">98% Shared Interests</div>
           </div>
        </motion.div>

        {/* FLOATING ELEMENT 2: Stat Pill (Bottom Left) */}
        <motion.div
          animate={floatAnim(1.5)}
          className="absolute -bottom-6 -left-[5%] md:-left-12 z-40 px-4 py-3 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-xl flex items-center gap-3"
          style={{ transform: "translateZ(40px)" }}
        >
             <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <TrendingUp className="w-4 h-4 text-emerald-400" />
             </div>
             <div>
                 <div className="text-sm font-bold text-white leading-none">1,240</div>
                 <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Live Connections</div>
             </div>
        </motion.div>

        {/* FLOATING ELEMENT 3: Abstract Orb (Top Left) */}
        <motion.div
          animate={floatAnim(0.5)}
          className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-brand-500/20 blur-xl mix-blend-screen"
          style={{ transform: "translateZ(-40px)" }}
        />
        <motion.div
          animate={floatAnim(0.5)}
           className="absolute -top-10 -left-10 w-16 h-16 rounded-full border border-brand-500/30 bg-brand-500/10 backdrop-blur-sm"
           style={{ transform: "translateZ(-20px)" }}
        />

        {/* FLOATING ELEMENT 4: Abstract Orb (Bottom Right) */}
        <motion.div
          animate={floatAnim(2)}
          className="absolute -bottom-16 -right-8 w-32 h-32 rounded-full bg-purple-600/20 blur-2xl mix-blend-screen"
          style={{ transform: "translateZ(20px)" }}
        />

        {/* Glow Effects behind everything */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-500/10 blur-[100px] -z-10 rounded-full pointer-events-none" />

      </motion.div>
    </div>
  );
}
