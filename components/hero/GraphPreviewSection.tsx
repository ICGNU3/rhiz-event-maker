"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NetworkingGraph } from "@/components/networking/NetworkingGraph";
import { GraphAttendee } from "@/lib/types";

const MOCK_DATE = new Date().toISOString();
const DEMO_ATTENDEES: GraphAttendee[] = [
  { person_id: "1", preferred_name: "Sarah (Designer)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:1", email: "sarah@example.com" },
  { person_id: "2", preferred_name: "Davide (Founder)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:2", email: "davide@example.com" },
  { person_id: "3", preferred_name: "Yuki (Engineer)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:3", email: "yuki@example.com" },
  { person_id: "4", preferred_name: "Elena (Product)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:4", email: "elena@example.com" },
  { person_id: "5", preferred_name: "Marcus (VC)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:5", email: "marcus@example.com" },
  { person_id: "6", preferred_name: "Priya (Artist)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:6", email: "priya@example.com" },
  { person_id: "7", preferred_name: "Tom (DevRel)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:7", email: "tom@example.com" },
  { person_id: "8", preferred_name: "Jin (Architect)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:8", email: "jin@example.com" },
  { person_id: "9", preferred_name: "Sophie (Writer)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:9", email: "sophie@example.com" },
  { person_id: "10", preferred_name: "Alex (Marketer)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:10", email: "alex@example.com" },
  { person_id: "11", preferred_name: "Ravi (Data)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:11", email: "ravi@example.com" },
  { person_id: "12", preferred_name: "Zoe (Crypto)", imageFromUrl: "", tags: [], owner_id: "mock", created_at: MOCK_DATE, updated_at: MOCK_DATE, did: "did:rhiz:12", email: "zoe@example.com" },
];

export function GraphPreviewSection() {
  return (
    <section className="relative w-full py-24 px-6 border-t border-surface-900/50 bg-black overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Copy */}
        <div className="lg:w-1/3 space-y-8 text-center lg:text-left z-10">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight leading-[1.1]">
            See Your Future <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
               Network.
            </span>
          </h2>
          <p className="text-lg text-surface-400 leading-relaxed">
            Events aren&apos;t just about content. They&apos;re about connection.
            <br className="hidden md:block" />
            Our AI maps the room before you even arrive.
          </p>
          
          <div className="pt-4">
            <Link 
               href="/create"
               className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-brand-50 text-black font-bold rounded-full transition-all hover:scale-105 group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
               Claim Your Node
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs text-surface-600 mt-4 uppercase tracking-widest">
               Powered by Rhiz Identity
            </p>
          </div>
        </div>

        {/* Right: Graph */}
        <div className="lg:w-2/3 w-full h-[500px] relative">
           <NetworkingGraph 
              featuredAttendees={DEMO_ATTENDEES}
              totalCount={450}
              matchmakingEnabled={true}
              isLoading={false}
              relationships={[
                  { 
                      relationship_id: "r1", 
                      owner_id: "mock", 
                      source_person_id: "1", 
                      target_person_id: "2", 
                      strength_score: 0.9, 
                      recency_score: 0.8,
                      frequency_score: 0.8,
                      interaction_count: 5 
                  },
                  { 
                      relationship_id: "r2", 
                      owner_id: "mock", 
                      source_person_id: "3", 
                      target_person_id: "5", 
                      strength_score: 0.8,
                      recency_score: 0.7,
                      frequency_score: 0.7,
                      interaction_count: 3 
                  }
              ]}
              onNodeClick={() => {}} 
           />
        </div>

      </div>
    </section>
  );
}
