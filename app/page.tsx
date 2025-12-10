import Link from "next/link";
import { FloatingHeroComposition } from "@/components/hero/FloatingHeroComposition";


import { AiCapabilities } from "./components/AiCapabilities";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-950 bg-noise text-foreground font-sans selection:bg-brand-500/30 overflow-x-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-brand-500/10 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[80px] animate-pulse-slow" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 lg:pt-32 pb-24 min-h-screen flex flex-col justify-center">
        <div className="lg:flex lg:items-center lg:gap-16">
          {/* Left Side: Text Content */}
          <div className="lg:w-1/2 space-y-10 animate-fade-in text-center lg:text-left">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl font-heading font-bold tracking-tighter text-white leading-[0.9]">
                Event <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
                  Architect
                </span>
              </h1>
              <p className="text-xl text-surface-300 font-light max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Design intelligent, identity-aware event experiences powered by Rhiz Protocol.
                Define the soul of your gathering in seconds.
              </p>
            </div>
            
            <div className="pt-8 border-t border-surface-800/50 flex flex-col items-center lg:items-start">
              <div className="flex items-center gap-4 text-surface-500 text-xs tracking-widest uppercase mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                System Status: Active
              </div>

              <Link 
                href="/create"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-brand-50 text-black font-heading font-bold text-xl rounded-full transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-glow-md group"
              >
                Start Building
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Right Side: 3D Composition */}
          <div className="lg:w-1/2 mt-20 lg:mt-0 flex justify-center items-center">
              <FloatingHeroComposition />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 max-w-8xl mx-auto px-6 py-24 border-t border-surface-900/50 bg-surface-950/50 backdrop-blur-sm">
         <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl md:text-5xl font-heading font-bold text-white">Intelligence Built In.</h2>
             <p className="text-surface-400 max-w-2xl mx-auto">Every step of your event lifecycle is optimized by our specialized agents.</p>
         </div>
         <AiCapabilities />
      </section>

    </div>
  );
}
