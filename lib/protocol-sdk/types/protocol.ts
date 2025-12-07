/**
 * Protocol Core Types
 * 
 * Core types for interactions, relationships, and trust events.
 */

export interface InteractionCreate {
  owner_id: string;
  actor_person_id?: string;
  partner_person_id?: string;
  channel_id?: string;
  timestamp: string; // ISO datetime
  direction?: string;
  summary?: string;
  context_tags?: string[];
  outcome_tag?: string;
  duration_minutes?: number;
  emotion_tone?: string;
}

export interface InteractionRead {
  interaction_id: string;
  owner_id: string;
  actor_person_id?: string;
  partner_person_id?: string;
  channel_id?: string;
  timestamp: string;
  direction?: string;
  summary?: string;
  context_tags?: string[];
  outcome_tag?: string;
  duration_minutes?: number;
  emotion_tone?: string;
  created_at: string;
}

export interface RelationshipRead {
  relationship_id: string;
  owner_id: string;
  source_person_id: string;
  target_person_id: string;
  direction?: string;
  relationship_type?: string;
  strength_score: number;
  recency_score: number;
  frequency_score: number;
  last_interaction_at?: string;
  relationship_state?: string;
  notes_summary?: string;
}

export interface RelationshipDetail extends RelationshipRead {
  interaction_count: number;
  latest_interaction_at?: string;
}

export interface TrustEventRead {
  trust_event_id: string;
  relationship_id: string;
  interaction_id?: string;
  previous_trust_score?: number;
  new_trust_score?: number;
  trust_delta?: number;
  recency_component?: number;
  frequency_component?: number;
  bidirectionality_component?: number;
  provenance_component?: number;
  context_match_component?: number;
  reinforcement_component?: number;
  outcome_component?: number;
  explanation?: string;
  created_at: string;
}

export interface InteractionResponse {
  interaction: InteractionRead;
  relationship: RelationshipRead;
  trust_event: TrustEventRead;
}

export interface RelationshipListResponse {
  relationships: RelationshipDetail[];
  total: number;
  limit: number;
  offset: number;
}

export interface InteractionListResponse {
  interactions: InteractionRead[];
  total: number;
  limit: number;
  offset: number;
}

export interface TrustEventListResponse {
  trust_events: TrustEventRead[];
  total: number;
  limit: number;
  offset: number;
}

export interface RelationshipSummary {
  relationship?: RelationshipRead;
  recent_interactions: InteractionRead[];
  recent_trust_events: TrustEventRead[];
}
