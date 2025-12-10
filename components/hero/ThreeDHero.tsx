"use client";

import { useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import Image from "next/image";

export function ThreeDHero() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Parallax translations
  const translateX_Nodes = useTransform(x, [-0.5, 0.5], [-20, 20]);
  const translateY_Nodes = useTransform(y, [-0.5, 0.5], [-20, 20]);
  
  const translateX_Lines = useTransform(x, [-0.5, 0.5], [-60, 60]);
  const translateY_Lines = useTransform(y, [-0.5, 0.5], [-60, 60]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate normalized position (-0.5 to 0.5)
    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="absolute inset-0 z-0 overflow-hidden bg-[#02040A] flex items-center justify-center"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
       {/* Ambient Background Gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02040A] via-[#050a14] to-[#02040A] z-0" />
      
      {/* 3D Container */}
      <motion.div
        ref={containerRef}
        className="relative w-full h-full preserve-3d"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Layer 1: Base Nodes (Background) */}
        <motion.div 
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{ 
            x: translateX_Nodes,
            y: translateY_Nodes,
            z: -50,
            scale: 1.1 // Scale up slightly to avoid edge gaps
          }}
        >
          <div className="relative w-full h-full max-w-[1920px] mx-auto">
            <Image
              src="/hero-assets/nodes-layer.png"
              alt="Nodes Foundation"
              fill
              className="object-cover opacity-80"
              priority
            />
          </div>
        </motion.div>
        
        {/* Layer 2: Flow Lines (Foreground) */}
        <motion.div 
          className="absolute inset-0 w-full h-full flex items-center justify-center mix-blend-screen pointer-events-none"
          style={{ 
            x: translateX_Lines,
            y: translateY_Lines,
            z: 50, // Pop out towards screen
          }}
        >
             <div className="relative w-full h-full max-w-[1920px] mx-auto">
               <Image
                src="/hero-assets/flow-lines-layer.png"
                alt="Data Flow"
                fill
                className="object-cover opacity-100"
                priority
              />
            </div>
        </motion.div>

        {/* Floating Particles/Glow (Simulated with code for extra life) */}
        <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full blur-[2px] animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-violet-500 rounded-full blur-[3px] animate-pulse" style={{ animationDelay: '1s'}} />
        </div>

      </motion.div>

      {/* Vignette Overlay to focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#02040A_100%)] z-20 pointer-events-none" />
    </div>
  );
}
