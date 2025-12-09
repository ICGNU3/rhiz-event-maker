"use client";

import { EventLandingPage } from "../components/EventLandingPage";
import { EventAppConfig } from "@/lib/types";

// Enhanced config for the "Convergence Intelligence Summit" Demo
const demoConfig = { // Typed dynamically due to demo data structure mismatch, cast at end
  eventId: "demo-convergence-summit",
  primaryGoals: ["Network Coordination", "Systemic Trust", "Intelligence Layering"],
  matchmakingConfig: {
    enabled: true,
    inputSignals: ["trust_clusters", "timing_indicators", "contribution_profiles", "shared_mission"],
    matchTypes: ["cluster_of_8", "convergence_circle", "1:1_high_value"],
    meetingDurations: [15, 45, 60]
  },
  sessionConfig: {
    tracksEnabled: true,
    maxConcurrentSessions: 4,
    sessionTypes: ["keynote", "activation", "convergence_circle"]
  },
  engagementConfig: {
    chatEnabled: true,
    qnaEnabled: true,
    pollsEnabled: true,
    liveFeedEnabled: true
  },
  relationshipFeatures: {
    relationshipScoresVisible: true,
    warmPathHintsEnabled: true,
    introRequestsEnabled: true
  },
  branding: {
    primaryColor: "#0F172A", // Slate 900
    accentColor: "#38BDF8", // Sky 400
    toneKeywords: ["strategic", "ambitious", "intelligent", "coordinate", "luxury"] // Added luxury for the theme
  },
  // Dynamic Canvas Background
  backgroundImage: "dynamic-network", 
  designNotes: "Cinematic, deep, intelligence-driven",
  content: {
    eventName: "Convergence Intelligence Summit",
    tagline: "Coordination replaces competition when networks can see themselves.",
    date: "May 12-14, 2026",
    location: "Presidio, San Francisco",
    speakers: [
      { 
        name: "Dan Koppelkamm", 
        role: "Host & Convener", 
        company: "Convergence Partners", 
        bio: "Leading the transition from competition to coordination.", 
        imageUrl: "https://ui-avatars.com/api/?name=Dan+Koppelkamm&background=38BDF8&color=fff&size=400" // Initials Avatar to avoid "wrong person" issue per user request
      },
      { 
        name: "Reid Hoffman", 
        role: "Partner", 
        company: "Greylock", 
        bio: "Architecting systems that coordinate at scale.", 
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Reid_Hoffman_(1).jpg/400px-Reid_Hoffman_(1).jpg" 
      },
      { 
        name: "Anne-Marie Slaughter", 
        role: "CEO", 
        company: "New America", 
        bio: "Redefining civic networks.", 
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Anne-Marie_Slaughter.jpg/400px-Anne-Marie_Slaughter.jpg" 
      },
      { 
        name: "Salim Ismail", 
        role: "Founder", 
        company: "OpenExO", 
        bio: "Exponential organizations and systems.", 
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces" // Keeping this as it's less famous, maybe? No, let's keep placeholder if not found easily.
      },
      { 
        name: "Tim O'Reilly", 
        role: "Founder", 
        company: "O'Reilly Media", 
        bio: "Mapping the future of work and identity.", 
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Tim_O%27Reilly_%283%29.jpg/400px-Tim_O%27Reilly_%283%29.jpg" 
      },
      { 
        name: "Aaron Levie", 
        role: "CEO", 
        company: "Box", 
        bio: "Enterprise velocity and digital identity.", 
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces" 
      },
      { 
        name: "Vitalik Buterin", 
        role: "Co-founder", 
        company: "Ethereum", 
        bio: "Building network-aware immutable tools.", 
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/VitalikButerinProfile.jpg/400px-VitalikButerinProfile.jpg" 
      },
      { 
        name: "Meredith Whittaker", 
        role: "President", 
        company: "Signal", 
        bio: "Privacy as infrastructure for trust.", 
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces" 
      },
      { 
        name: "Glen Weyl", 
        role: "Founder", 
        company: "RadicalxChange", 
        bio: "Plurality and democratic mechanisms.", 
        imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=faces" 
      }
    ],
    schedule: [
      // Pre-Event / Opening
      { 
        id: "s0", 
        time: "09:00", 
        title: "Opening Keynote: The Logic of Convergence", 
        speakerName: "Dan Koppelkamm", 
        speakerRole: "Host & Convener", 
        track: "Main Stage", 
        isWide: true,
        description: "Dan introduces the event as a working laboratory for relational intelligence, framing the shift from competition to coordination." 
      },
      { 
        id: "s0_1", 
        time: "10:00", 
        title: "Network Activation: Forming Trust Clusters", 
        speakerName: "System", 
        speakerRole: "WeRhiz AI", 
        track: "Activation", 
        isWide: false,
        description: "The Rhiz system forms dynamic clusters of eight based on pre-event alignment signals to kickstart high-trust collaboration." 
      },
      
      // Pillar 1: Systems That Coordinate
      { 
        id: "p1_key", 
        time: "11:00", 
        title: "Keynote: Systems That Coordinate", 
        speakerName: "Reid Hoffman", 
        speakerRole: "Partner", 
        track: "Main Stage", 
        isWide: false,
        description: "Reid explores the role of network intelligence in shaping the next generation of economic and political systems." 
      },
      { 
        id: "p1_act", 
        time: "12:00", 
        title: "Activation: Cross-Sector Scenarios", 
        speakerName: "Salim Ismail", 
        speakerRole: "Facilitator", 
        track: "Activation", 
        isWide: false,
        description: "Three cross-sector clusters, predicted to have high potential, explore 'What becomes possible when coordination becomes measurable?'"
      },
      
      // Pillar 2: Future of Work
      { 
        id: "p2_key", 
        time: "13:30", 
        title: "Keynote: Post-Job Identity Pathways", 
        speakerName: "Tim O'Reilly", 
        speakerRole: "Speaker", 
        track: "Main Stage", 
        isWide: false,
        description: "Tim discusses the shift away from traditional job-based economies toward multi-stream contribution and identity."
      },
      { 
        id: "p2_act", 
        time: "14:30", 
        title: "Live Teams: Multi-Stream Contribution", 
        speakerName: "Aaron Levie", 
        speakerRole: "Facilitator", 
        track: "Activation", 
        isWide: false,
        description: "WeRhiz identifies participants with intersecting workstreams and forms live teams for a guided exercise on new identity pathways."
      },

      // Pillar 4: Builders (Closing Day 1)
      { 
        id: "p4_circle", 
        time: "16:00", 
        title: "Convergence Circles: Civic & Creative Ecosystems", 
        speakerName: "Vitalik Buterin", 
        speakerRole: "Lead", 
        track: "Circles", 
        isWide: true,
        description: "Real-time formed circles discuss civic networks, capital formation, and privacy, led by Vitalik and other builders."
      }
    ],
    sampleAttendees: [
      { id: "a1", name: "Elena R.", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces", interests: ["Civic Tech", "Governance"] },
      { id: "a2", name: "Marcus J.", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces", interests: ["Venture Capital", "Network Effects"] },
      { id: "a3", name: "Sarah L.", imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces", interests: ["AI Policy", "Ethics"] },
      { id: "a4", name: "David K.", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces", interests: ["Urban Planning", "Systems"] },
      { id: "a5", name: "Priya M.", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces", interests: ["Digital Identity", "Privacy"] }
    ]
  }
} as unknown as EventAppConfig;

export default function DemoPage() {
  return <EventLandingPage config={demoConfig} />;
}
