/**
 * Channels Types
 * 
 * Types for communication channels and analytics.
 */

export interface ChannelBase {
  name: string;
  channel_metadata?: Record<string, any>;
}

export interface ChannelCreate extends ChannelBase {
  owner_id: string;
}

export interface ChannelUpdate {
  name?: string;
  channel_metadata?: Record<string, any>;
}

export interface ChannelRead extends ChannelBase {
  channel_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChannelListResponse {
  channels: ChannelRead[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChannelEffectivenessResponse {
  channel_id: string;
  channel_name: string;
  avg_trust_delta: number;
  success_rate: number;
  interaction_count: number;
  avg_outcome_score: number;
  positive_outcomes: number;
  negative_outcomes: number;
  neutral_outcomes: number;
}

export interface ChannelROIResponse {
  channel_id: string;
  channel_name: string;
  total_interactions: number;
  positive_outcomes: number;
  negative_outcomes: number;
  avg_trust_gain: number;
  total_trust_gain: number;
}

export interface OptimalTimingHour {
  hour: number;
  success_rate: number;
}

export interface OptimalTimingDay {
  day: string;
  success_rate: number;
}

export interface OptimalTimingResponse {
  channel_id: string;
  channel_name: string;
  best_hours: OptimalTimingHour[];
  best_days: OptimalTimingDay[];
  effectiveness_by_hour: Record<number, number>;
  effectiveness_by_day: Record<string, number>;
}

export interface ChannelAnalyticsSummary {
  channel_id: string;
  channel_name: string;
  interaction_count: number;
  avg_trust_delta: number;
  success_rate: number;
  total_trust_gain: number;
}

export interface AllChannelsAnalyticsResponse {
  channels: ChannelAnalyticsSummary[];
}

export interface ChannelsQueryParams {
  page?: number;
  page_size?: number;
  limit?: number; // Alias for page_size for backward compatibility
  search?: string;
}
