/**
 * Context Tags Types
 * 
 * Types for context tags and categorization.
 */

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
