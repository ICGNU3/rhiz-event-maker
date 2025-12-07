"use client";

import { useState, useTransition, useCallback } from "react";
import { generateEventConfig } from "./actions";
import { EventAppConfig } from "@/lib/baml_client/baml_client/types";
import { EventLandingPage } from "./components/EventLandingPage";
import { getUserFriendlyMessage } from "@/lib/errors";

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<EventAppConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);

  const handleSubmit = useCallback((formData: FormData) => {
    setError(null);
    setLastFormData(formData); // Save for retry
    
    startTransition(async () => {
      try {
        const config = await generateEventConfig(formData);
        setResult(config);
        setRetryCount(0); // Reset retry count on success
      } catch (e) {
        console.error("Submission error:", e);
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    });
  }, []);

  const handleRetry = useCallback(() => {
    if (lastFormData) {
      setRetryCount(prev => prev + 1);
      handleSubmit(lastFormData);
    }
  }, [lastFormData, handleSubmit]);

  if (result) {
    return (
      <>
        {/* Floating Back Button */}
        <div className="fixed top-4 right-4 z-50">
          <button 
             onClick={() => setResult(null)}
             className="px-4 py-2 bg-black/80 text-white backdrop-blur-md rounded-full text-sm font-medium hover:bg-black transition-colors shadow-lg border border-white/10"
          >
            ← Back to Editor
          </button>
        </div>
        
        <EventLandingPage config={result} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-foreground font-sans selection:bg-brand-500/30">
      <main className="max-w-7xl mx-auto px-6 py-24 lg:flex lg:items-start lg:gap-24">
        {/* Cinematic Header */}
        <header className="lg:w-1/3 space-y-8 sticky top-24 self-start animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-heading font-bold tracking-tighter text-white leading-[0.9]">
              Event <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
                Architect
              </span>
            </h1>
            <p className="text-lg text-surface-400 font-light max-w-sm leading-relaxed">
              Design intelligent, identity-aware event experiences powered by Rhiz Protocol.
              Define the soul of your gathering in seconds.
            </p>
          </div>
          
          <div className="pt-8 border-t border-surface-800">
            <div className="flex items-center gap-4 text-surface-500 text-xs tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Status: Active
            </div>
          </div>
        </header>

        {/* Configuration Cockpit */}
        <div className="lg:w-2/3 mt-16 lg:mt-0 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <section className="bg-surface-900/50 backdrop-blur-xl border border-surface-800 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-white/5">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-heading font-semibold text-white tracking-tight">
                Configuration Parameters
              </h2>
              <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                v2.0.0
              </span>
            </div>

            <form action={handleSubmit} className="space-y-10">
              
              {/* Event Essence */}
              <div className="space-y-4 group">
                <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
                  01 // Event Essence
                </label>
                <textarea
                  name="eventBasics"
                  placeholder="Describe your event... e.g. 'A high-energy hackathon in Tokyo for 200 crypto-natives looking to build the future of privacy.'"
                  className="w-full bg-surface-950 border-0 border-b-2 border-surface-800 focus:border-brand-500 text-2xl md:text-3xl font-light text-white placeholder-surface-700 py-4 px-0 resize-none outline-none transition-all focus:ring-0 min-h-[160px] leading-tight"
                  required
                />
              </div>

              {error && (
                <div className="p-6 bg-red-900/20 border border-red-500/20 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-red-400 mb-2">
                        Generation Failed
                      </h4>
                      <p className="text-surface-300 text-sm mb-4">
                        {getUserFriendlyMessage(error)}
                      </p>
                      
                      {retryCount > 0 && (
                        <p className="text-surface-500 text-xs mb-4">
                          Retry attempt: {retryCount}
                        </p>
                      )}
                      
                      <button
                        onClick={handleRetry}
                        disabled={isPending}
                        className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? 'Retrying...' : 'Try Again →'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4 group">
                  <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
                    02 // Event Date
                  </label>
                  <input
                    name="eventDate"
                    type="text"
                    placeholder="e.g., 'Oct 12-14, 2025' or 'December 15, 2025'"
                    className="w-full bg-transparent border-0 border-b border-surface-700 focus:border-brand-500 text-xl text-white placeholder-surface-600 py-3 px-0 outline-none transition-all focus:ring-0"
                    required
                  />
                </div>

                <div className="space-y-4 group">
                  <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
                    03 // Location
                  </label>
                  <input
                    name="eventLocation"
                    type="text"
                    placeholder="e.g., 'Brooklyn, NY' or 'San Francisco, CA'"
                    className="w-full bg-transparent border-0 border-b border-surface-700 focus:border-brand-500 text-xl text-white placeholder-surface-600 py-3 px-0 outline-none transition-all focus:ring-0"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Strategic Goals */}
                <div className="space-y-4 group">
                  <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
                    04 // Strategic Goals
                  </label>
                  <input
                    name="goals"
                    placeholder="Networking, Dealflow..."
                    className="w-full bg-transparent border-0 border-b border-surface-700 focus:border-brand-500 text-xl text-white placeholder-surface-600 py-3 px-0 outline-none transition-all focus:ring-0"
                    required
                  />
                  <p className="text-xs text-surface-500">Comma separated objectives</p>
                </div>

                {/* Target Audience */}
                <div className="space-y-4 group">
                  <label className="text-xs font-mono text-brand-300 uppercase tracking-widest group-focus-within:text-brand-400 transition-colors">
                    05 // Audience Profile
                  </label>
                  <input
                    name="audience"
                    placeholder="Founders, VCs, Builders..."
                    className="w-full bg-transparent border-0 border-b border-surface-700 focus:border-brand-500 text-xl text-white placeholder-surface-600 py-3 px-0 outline-none transition-all focus:ring-0"
                  />
                </div>
              </div>

              {/* Vibe & Connection */}
              <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <label className="text-xs font-mono text-surface-500 uppercase tracking-widest">
                    Atmosphere
                  </label>
                  <div className="relative">
                    <select
                      name="tone"
                      className="w-full appearance-none bg-surface-800/50 hover:bg-surface-800 text-white rounded-xl px-6 py-4 outline-none border border-surface-700 focus:border-brand-500 transition-all cursor-pointer text-lg font-medium"
                    >
                      <option value="professional">Professional & Crisp</option>
                      <option value="vibrant">Vibrant & Electric</option>
                      <option value="casual">Casual & Organic</option>
                      <option value="luxury">Luxury & Exclusive</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
                      ↓
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono text-surface-500 uppercase tracking-widest">
                    Connection Density
                  </label>
                  <div className="relative">
                    <select
                      name="relationshipIntent"
                      className="w-full appearance-none bg-surface-800/50 hover:bg-surface-800 text-white rounded-xl px-6 py-4 outline-none border border-surface-700 focus:border-brand-500 transition-all cursor-pointer text-lg font-medium"
                    >
                      <option value="high">Active Matchmaking</option>
                      <option value="medium">Organic Networking</option>
                      <option value="low">Content Focused</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
                      ↓
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden Fields for Defaults */}
              <input type="hidden" name="sessionShape" value="standard" />
              <input type="hidden" name="matchmakingAppetite" value="high" />
              <input type="hidden" name="tools" value="standard" />

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group relative w-full py-6 bg-white hover:bg-brand-50 rounded-2xl text-black font-heading font-bold text-xl tracking-tight transition-all transform hover:scale-[1.01] hover:shadow-2xl hover:shadow-white/20 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isPending ? (
                      <>
                        <span className="animate-spin text-2xl">✺</span>
                        {retryCount > 0 ? (
                          <>Retrying Generation (Attempt {retryCount + 1})...</>
                        ) : (
                          <>Initializing Event Protocol...</>
                        )}
                      </>
                    ) : (
                      <>
                        Generate Event Experience
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
                <p className="text-center text-surface-500 text-xs mt-4">
                  Powered by Rhiz Intelligence • Generates configuration in ~15s
                </p>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
