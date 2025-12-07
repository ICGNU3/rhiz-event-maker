/**
 * Organization Types
 * 
 * Types for organizations and related entities.
 */

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
