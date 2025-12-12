"use client";

import React, { useEffect, useRef, useCallback } from 'react';

// Configuration
const CONFIG = {
  pointCount: 60,
  connectionDistance: 150,
  mouseDistance: 200,
  speedFactor: 0.3,
  // Frame throttling: target ~30fps on mobile, 60fps on desktop
  mobileFrameInterval: 33, // ~30fps
  desktopFrameInterval: 16, // ~60fps
  mobileBreakpoint: 768,
} as const;

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: number;
}

export const InteractiveNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);
  const prefersReducedMotionRef = useRef(false);
  const lastFrameTimeRef = useRef(0);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points: Point[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = motionQuery.matches;
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Check if mobile
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < CONFIG.mobileBreakpoint;
    };
    checkMobile();

    // Initialize points
    const initPoints = () => {
      points = [];
      for (let i = 0; i < CONFIG.pointCount; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * CONFIG.speedFactor,
          vy: (Math.random() - 0.5) * CONFIG.speedFactor,
          id: i,
        });
      }
    };

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (containerRef.current && canvas) {
          width = containerRef.current.offsetWidth;
          height = containerRef.current.offsetHeight;
          canvas.width = width;
          canvas.height = height;
          checkMobile();
          initPoints();
        }
      }, 100);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    // Optimized draw with frame throttling
    const draw = (timestamp: number) => {
      // Skip if not visible or reduced motion preferred
      if (!isVisibleRef.current) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      // If reduced motion, draw static points once and stop
      if (prefersReducedMotionRef.current) {
        drawStaticFrame();
        return;
      }

      // Frame throttling based on device
      const frameInterval = isMobileRef.current 
        ? CONFIG.mobileFrameInterval 
        : CONFIG.desktopFrameInterval;
      
      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed < frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTimeRef.current = timestamp;

      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Update and draw points
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        point.x += point.vx;
        point.y += point.vy;

        // Bounce off walls
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;

        // Mouse interaction
        const dxMouse = point.x - mouseX;
        const dyMouse = point.y - mouseY;
        const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
        const mouseDistSq = CONFIG.mouseDistance * CONFIG.mouseDistance;
        
        if (distMouseSq < mouseDistSq) {
          const distMouse = Math.sqrt(distMouseSq);
          const angle = Math.atan2(dyMouse, dxMouse);
          point.vx += Math.cos(angle) * 0.01;
          point.vy += Math.sin(angle) * 0.01;
        }

        // Draw Point
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fill();
      }

      // Draw connections - optimized to avoid duplicate draws
      const connDistSq = CONFIG.connectionDistance * CONFIG.connectionDistance;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            const distance = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            const opacity = 1 - (distance / CONFIG.connectionDistance);
            ctx.strokeStyle = `rgba(50, 189, 248, ${opacity * 0.2})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Static frame for reduced motion
    const drawStaticFrame = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fill();
      }

      const connDistSq = CONFIG.connectionDistance * CONFIG.connectionDistance;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            const distance = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            const opacity = 1 - (distance / CONFIG.connectionDistance);
            ctx.strokeStyle = `rgba(50, 189, 248, ${opacity * 0.2})`;
            ctx.stroke();
          }
        }
      }
    };

    // Intersection Observer for visibility-based pausing
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('mousemove', handleMouseMove);
    }
    
    // Initial setup
    if (containerRef.current && canvas) {
      width = containerRef.current.offsetWidth;
      height = containerRef.current.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      initPoints();
    }
    
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      if (currentContainer) {
        currentContainer.removeEventListener('mousemove', handleMouseMove);
        observer.unobserve(currentContainer);
      }
      if (resizeTimeout) clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#0F172A]"
      aria-hidden="true"
    >
        {/* Deep Gradient Background base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#020617] to-[#1e293b] opacity-90" />
        
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 z-0"
            style={{ willChange: 'contents' }}
        />
        
        {/* Overlay gradient to fade edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent z-10 pointer-events-none" />
    </div>
  );
};
