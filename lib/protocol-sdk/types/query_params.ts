/**
 * Common Query Parameters
 * 
 * Shared query parameter types used across multiple endpoints.
 */

import type { GoalStatus, GoalType, GoalPriority } from './goals';
import type { ProcessType, ProcessStatus } from './processes';

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
