/**
 * Processes (MDAP) Types
 * 
 * Types for MDAP processes, steps, and execution.
 */

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
