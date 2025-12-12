/**
 * Agents Types
 * 
 * Types for agent profiles, chat, and interactions.
 */

export interface AgentInteractionSummary {
  timestamp: string;
  summary: string;
  context_tags: string[];
  outcome_tag?: string;
}

export interface AgentCredentialView {
  type: string[];
  issuer_did?: string;
  claims: Record<string, unknown>;
  issued_at?: string;
  expires_at?: string;
}

export interface AgentReferralStatsView {
  total_descendants: number;
  total_ancestors: number;
  total_value_attributed: number;
  direct_referrals_count: number;
  indirect_referrals_count: number;
}

export interface DIDAgentProfile {
  did: string;
  person_id: string;
  preferred_name?: string;
  legal_name?: string;
  headline?: string;
  bio_summary?: string;
  primary_role?: string;
  tags: string[];
  credentials: AgentCredentialView[];
  referral_stats?: AgentReferralStatsView;
  recent_interactions: AgentInteractionSummary[];
}

export interface AgentChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentChatRequest {
  messages: AgentChatMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface AgentChatResponse {
  did: string;
  agent_name: string;
  profile?: DIDAgentProfile;
  response_message: AgentChatMessage;
  usage?: Record<string, unknown>;
}
