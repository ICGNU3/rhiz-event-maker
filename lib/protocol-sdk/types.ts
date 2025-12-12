/**
 * TypeScript type definitions for Rhiz Protocol v0.2.0
 * 
 * This file provides backward compatibility for the refactored type system.
 * The actual type definitions are now in the types/ subdirectory.
 */

// Re-export all types from the modular structure
export * from './types';

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

// ============================================================
// People Types
// ============================================================

export interface PersonBase {
  legal_name?: string;
  preferred_name?: string;
  emails?: string[];
  phones?: string[];
  social_handles?: Record<string, string>;
  primary_role?: string;
  headline?: string;
  bio_summary?: string;
  tags?: string[];
  
  // Identity Fields
  handle?: string;
  email?: string;
  wallet_address?: string; // EVM/Solana address
  is_claimed?: boolean;
  
  did?: string;
}

export interface PersonCreate extends PersonBase {
  owner_id: string;
}

export interface PersonUpdate {
  legal_name?: string;
  preferred_name?: string;
  emails?: string[];
  phones?: string[];
  social_handles?: Record<string, string>;
  primary_role?: string;
  headline?: string;
  bio_summary?: string;
  tags?: string[];
  
  // Identity Fields
  handle?: string;
  email?: string;
  wallet_address?: string;
  is_claimed?: boolean;
  
  did?: string;
}

export interface PersonRead extends PersonBase {
  person_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface PersonListResponse {
  people: PersonRead[];
  total: number;
  limit: number;
  offset: number;
}

export interface PersonBulkResponse {
  count: number;
  ids: string[];
  skipped: number;
  errors: string[];
}

export interface OrganizationMembershipCreate {
  organization_id: string;
  role?: string;
  start_date?: string; // ISO date
  end_date?: string; // ISO date
  is_current?: boolean;
}

export interface OrganizationMembershipRead {
  membership_id: string;
  person_id: string;
  organization_id: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  created_at: string;
}

export interface PersonDetail extends PersonRead {
  organizations: OrganizationMembershipRead[];
}

// ============================================================
// Organization Types
// ============================================================

export interface OrganizationBase {
  name: string;
  type?: string;
  website?: string;
  description?: string;
  sector_tags?: string[];
  location?: string;
  size_range?: string;
  did?: string;
}

export interface OrganizationCreate extends OrganizationBase {
  owner_id: string;
}

export interface OrganizationUpdate {
  name?: string;
  type?: string;
  website?: string;
  description?: string;
  sector_tags?: string[];
  location?: string;
  size_range?: string;
  did?: string;
}

export interface OrganizationRead extends OrganizationBase {
  organization_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationListResponse {
  organizations: OrganizationRead[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================
// Goals Types
// ============================================================

export type GoalStatus = "draft" | "active" | "paused" | "completed" | "abandoned";
export type GoalType = 
  | "fundraising"
  | "hiring"
  | "career_shift"
  | "project_launch"
  | "learning"
  | "community_building";
export type GoalPriority = "low" | "medium" | "high" | "critical";

export interface GoalCreate {
  owner_person_id: string;
  title: string;
  description: string;
  type: GoalType;
  priority: GoalPriority;
  target_date?: string; // ISO date
  context_tags?: string[];
  constraints?: Record<string, unknown>;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  type?: GoalType;
  priority?: GoalPriority;
  target_date?: string; // ISO date
  status?: GoalStatus;
  context_tags?: string[];
  constraints?: Record<string, unknown>;
}

export interface GoalView {
  id: string;
  owner_person_id: string;
  title: string;
  description: string;
  type: GoalType;
  priority: GoalPriority;
  target_date?: string;
  status: GoalStatus;
  context_tags: string[];
  constraints: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GoalListResponse {
  goals: GoalView[];
  total: number;
  limit: number;
  offset: number;
}

export interface GoalAgentCandidate {
  did: string;
  person_id: string;
  reason: string;
  score: number;
}

export interface GoalTask {
  goal_id: string;
  goal_title: string;
  goal_description: string;
  goal_type: GoalType;
  goal_priority: GoalPriority;
  requester_did: string;
  requester_person_id: string;
  context_tags: string[];
  constraints: Record<string, unknown>;
}

export interface GoalTaskResponse {
  task: GoalTask;
  agent_response: string;
  agent_did: string;
}

export interface OrchestratedPlanStep {
  step_number: number;
  description: string;
  agent_did: string;
  agent_person_id: string;
  task: GoalTask;
  estimated_duration?: string;
  dependencies?: number[];
}

export interface OrchestratedPlan {
  goal_id: string;
  plan_id: string;
  steps: OrchestratedPlanStep[];
  total_estimated_duration?: string;
  confidence_score?: number;
}

// ============================================================
// Agents Types
// ============================================================

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

// ============================================================
// Processes (MDAP) Types
// ============================================================

export type ProcessStatus = "pending" | "running" | "paused" | "completed" | "failed" | "cancelled";
export type ProcessType = 
  | "FUNDRAISING_OUTREACH"
  | "JOB_SEARCH"
  | "NETWORK_EXPANSION"
  | "PARTNERSHIP_DEVELOPMENT"
  | "CUSTOM";
export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";
export type MicroagentType = 
  | "NETWORK_SCANNER"
  | "FIT_SCORER"
  | "INTRO_ROUTER"
  | "MESSAGE_DRAFTER"
  | "SEQUENCE_PLANNER"
  | "SAFETY_POLICY"
  | "RESULT_VALIDATOR"
  | "CONSENSUS";

export interface ProcessCreate {
  owner_person_id: string;
  goal_id: string;
  process_type: ProcessType;
  initial_state?: Record<string, unknown>;
}

export interface ProcessView {
  id: string;
  owner_person_id: string;
  goal_id: string;
  process_type: ProcessType;
  status: ProcessStatus;
  state_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProcessUpdate {
  status?: ProcessStatus;
  state_json?: Record<string, unknown>;
}

export interface ProcessListResponse {
  processes: ProcessView[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProcessStepView {
  id: string;
  process_id: string;
  step_type: string;
  status: StepStatus;
  microagent_type: MicroagentType;
  input_state: Record<string, unknown>;
  output_state?: Record<string, unknown>;
  attempt_count: number;
  error_count: number;
  needs_consensus: boolean;
  created_at: string;
  completed_at?: string;
}

export interface ProcessStepCreate {
  process_id: string;
  step_type: string;
  microagent_type: MicroagentType;
  input_state: Record<string, unknown>;
  needs_consensus?: boolean;
}

export interface ProcessExecutionRequest {
  step_id: string;
  force?: boolean;
}

export interface ProcessExecutionResponse {
  step: ProcessStepView;
  execution_status: "success" | "failed" | "skipped";
  error_message?: string;
  output_state?: Record<string, unknown>;
}

export interface ProcessDetailResponse extends ProcessView {
  steps: ProcessStepView[];
}

// ============================================================
// Common Query Parameters
// ============================================================

export interface ListQueryParams {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface PeopleQueryParams extends ListQueryParams {
  owner_id: string;
  name?: string;
  email?: string;
  tags?: string[];
}

export interface OrganizationsQueryParams extends ListQueryParams {
  owner_id: string;
  name?: string;
  sector_tags?: string[];
}

export interface GoalsQueryParams extends ListQueryParams {
  owner_person_id?: string;
  status?: GoalStatus;
  type?: GoalType;
  priority?: GoalPriority;
}

export interface ProcessesQueryParams extends ListQueryParams {
  owner_person_id?: string;
  goal_id?: string;
  process_type?: ProcessType;
  status?: ProcessStatus;
}

export interface RelationshipsQueryParams extends ListQueryParams {
  owner_id: string;
  person_id?: string;
  source_person_id?: string;
  target_person_id?: string;
  min_strength?: number;
  relationship_state?: string;
}

// ============================================================
// NLP Types
// ============================================================

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

export interface OpportunityMatch {
   suggestion: IntroductionSuggestion;
   candidate: PersonRead;
}

// ============================================================
// Channels Types
// ============================================================

export interface ChannelBase {
  name: string;
  channel_metadata?: Record<string, unknown>;
}

export interface ChannelCreate extends ChannelBase {
  owner_id: string;
}

export interface ChannelUpdate {
  name?: string;
  channel_metadata?: Record<string, unknown>;
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

// ============================================================
// Context Tags Types
// ============================================================

export interface ContextTagBase {
  label: string;
  description?: string;
  category?: string;
}

export interface ContextTagCreate extends ContextTagBase {
  owner_id: string;
}

export interface ContextTagUpdate {
  label?: string;
  description?: string;
  category?: string;
}

export interface ContextTagRead extends ContextTagBase {
  context_tag_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContextTagListResponse {
  context_tags: ContextTagRead[];
  total: number;
  limit: number;
  offset: number;
}

export interface ContextTagsQueryParams {
  page?: number;
  page_size?: number;
  limit?: number; // Alias for page_size for backward compatibility
  category?: string;
  search?: string;
}

// ============================================================
// Custom Attributes Types
// ============================================================

export type CustomAttributeValueType = 'string' | 'number' | 'boolean' | 'date' | 'json';

export interface CustomAttributeBase {
  entity_type: string;
  entity_id: string;
  attribute_key: string;
  attribute_value: string | number | boolean | Record<string, unknown> | unknown[];
  value_type: CustomAttributeValueType;
}

export interface CustomAttributeCreate extends CustomAttributeBase {
  owner_id: string;
}

export interface CustomAttributeUpdate {
  attribute_value?: string | number | boolean | Record<string, unknown> | unknown[];
  value_type?: CustomAttributeValueType;
}

export interface CustomAttributeRead extends CustomAttributeBase {
  attribute_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomAttributeListResponse {
  attributes: CustomAttributeRead[];
  total: number;
  page: number;
  page_size: number;
}

export interface CustomAttributesQueryParams {
  page?: number;
  page_size?: number;
  limit?: number; // Alias for page_size for backward compatibility
  entity_type?: string;
  entity_id?: string;
  attribute_key?: string;
  search?: string;
}

// ============================================================
// Zero Knowledge Types
// ============================================================

export interface ZKVerificationKeyCreate {
  owner_id: string;
  name: string;
  verification_key: Record<string, unknown>;
  description?: string;
  circuit_type?: string;
  version?: string;
}

export interface ZKVerificationKeyRead {
  vk_id: string;
  owner_id: string;
  name: string;
  verification_key: Record<string, unknown>;
  description?: string;
  circuit_type: string;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZKProofVerifyRequest {
  proof: Record<string, unknown>;
  public_signals: string[];
  vk_id?: string;
  vk_name?: string;
  verifier_person_id?: string;
}

export interface ZKProofLogRead {
  proof_log_id: string;
  verifier_person_id?: string;
  vk_id: string;
  public_signals: string[];
  proof_hash: string;
  verified_at: string;
}

export interface ZKVerifyResponse {
  verified: boolean;
  message: string;
  proof_log?: ZKProofLogRead;
}
