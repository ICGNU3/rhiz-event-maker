/**
 * People Types
 * 
 * Types for people, memberships, and related entities.
 */

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
