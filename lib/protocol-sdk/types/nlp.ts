/**
 * NLP Types
 * 
 * Types for natural language query parsing and pathfinding.
 */

export interface ParseQueryRequest {
  query: string;
}

export interface QueryFilters {
  tags?: string[];
  location?: string;
  interaction_date_range?: {
    from?: string;
    to?: string;
  };
  relationship_strength?: {
    min?: number;
    max?: number;
  };
  organization?: string;
  relationship_type?: string;
}

export interface QueryParseResult {
  filters: QueryFilters;
  entity_ids: string[];
  confidence: number;
}

export interface FindPathRequest {
  from_person_id: string;
  to_person_id: string;
  max_hops?: number;
}

export interface PathNode {
  person_id: string;
  person_name: string;
  trust_score?: number;
}

export interface WarmPath {
  path: PathNode[];
  path_strength: number;
  hop_count: number;
  suggestion?: string;
}

export interface IntroductionRequest {
  person1_id: string;
  person2_id: string;
}

export interface IntroductionSuggestion {
  match_score: number;
  reasons: string[];
  should_introduce: boolean;
  intro_message?: string;
}

export interface RelationshipInsights {
  relationship_type?: string;
  common_topics: string[];
  sentiment?: string;
  pending_actions: string[];
  summary: string;
}

export interface TagSuggestions {
  suggested_tags: string[];
  confidence: number;
}
