/**
 * Goals Types
 * 
 * Types for goals, orchestration, and planning.
 */

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
  constraints?: Record<string, any>;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  type?: GoalType;
  priority?: GoalPriority;
  target_date?: string; // ISO date
  status?: GoalStatus;
  context_tags?: string[];
  constraints?: Record<string, any>;
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
  constraints: Record<string, any>;
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
  constraints: Record<string, any>;
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
