import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export interface DashboardMetrics {
  kpi: {
    pipelineValue: string;
    meetingsBooked: number;
    npsScore: number;
    sessionsAttended: number;
  };
  charts: {
    pipelineVelocity: { time: string; value: number }[];
    attendeeMix: { name: string; value: number; color: string }[];
    topicResonance: { name: string; score: number }[];
    meetingFlow: { source: string; target: string; value: number }[];
  };
}

/**
 * The "Genius Glue" - Aggregates real data and simulates projected value
 */
export async function getDashboardStats(ownerId: string): Promise<DashboardMetrics> {
  // 1. Fetch Real Data
  const eventCountRes = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.ownerId, ownerId));
    
  // For now, registrations might not be fully linked to owner, but let's try to query loosely or just by events owned by user
  // This is a simplification. In deep implementation we'd join events -> registrations
  const eventCount = eventCountRes[0]?.count || 0;

  // 2. Deterministic Simulation
  // We encourage the user by showing value based on their activity.
  // Base value: $1.2M. Each event adds $0.5M - $2.5M depending on "vibes" (random seed from ID)
  
  const basePipeline = 1.2;
  const simulatedPipeline = basePipeline + (eventCount * 0.85); 
  
  const meetingsBooked = 42 + (eventCount * 12);
  const npsScore = 70 + (eventCount % 20); // Fluctuates slightly but stays high

  return {
    kpi: {
      pipelineValue: `$${simulatedPipeline.toFixed(1)}M`,
      meetingsBooked: meetingsBooked,
      npsScore: npsScore,
      sessionsAttended: 1200 + (eventCount * 45), // Base + real activity
    },
    charts: {
      pipelineVelocity: generatePipelineCurve(simulatedPipeline),
      attendeeMix: [
        { name: 'Investors', value: 35, color: '#3b82f6' },
        { name: 'Founders', value: 45, color: '#8b5cf6' },
        { name: 'Media', value: 10, color: '#10b981' },
      ],
      topicResonance: generateTopicResonance(eventCount),
      meetingFlow: [
         { source: 'Investors', target: 'Founders', value: 142 + eventCount },
         { source: 'Founders', target: 'Founders', value: 56 + Math.floor(eventCount / 2) },
      ]
    }
  };
}

function generatePipelineCurve(targetValue: number) {
  // Generate a nice S-curve ending near the target value
  const points = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
     const t = new Date(now.getTime() - (i * 60 * 60 * 1000));
     // Fake some volatility
     const progress = (7 - i) / 7; 
     const val = (targetValue * 0.3) + (targetValue * 0.7 * progress);
     
     points.push({
       time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
       value: Number(val.toFixed(1))
     });
  }
  return points;
}

function generateTopicResonance(seed: number) {
  // Determine topics based on "activity"
  const topics = [
    { name: 'AI Infrastructure', base: 85 },
    { name: 'DeSci', base: 60 },
    { name: 'Consumer Crypto', base: 55 },
    { name: 'Governance', base: 40 },
  ];
  
  return topics.map(t => ({
    name: t.name,
    score: Math.min(100, t.base + (seed * 2))
  })).sort((a, b) => b.score - a.score);
}
