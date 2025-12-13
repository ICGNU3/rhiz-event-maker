/**
 * Context Tags API Client for Rhiz Protocol v0.3.0
 */

import {
  ContextTagCreate,
  ContextTagRead,
  ContextTagUpdate,
  ContextTagListResponse,
  ContextTagsQueryParams,
} from './types';

export interface ContextTagsClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class ContextTagsClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: ContextTagsClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getAccessToken = options.getAccessToken;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken ? await this.getAccessToken() : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Rhiz-App-Id': 'eventmanage',
      'X-Rhiz-Contract-Version': '1.0',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${error.detail || error.message || response.statusText}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * Create a new context tag
   */
  async createContextTag(tag: ContextTagCreate): Promise<ContextTagRead> {
    return this.fetch<ContextTagRead>('/v1/protocol/context-tag', {
      method: 'POST',
      body: JSON.stringify(tag),
    });
  }

  /**
   * Get a context tag by ID
   */
  async getContextTag(tagId: string): Promise<ContextTagRead> {
    return this.fetch<ContextTagRead>(`/v1/protocol/context-tags/${tagId}`);
  }

  /**
   * Update a context tag
   */
  async updateContextTag(tagId: string, updates: ContextTagUpdate): Promise<ContextTagRead> {
    return this.fetch<ContextTagRead>(`/v1/protocol/context-tags/${tagId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a context tag
   */
  async deleteContextTag(tagId: string): Promise<void> {
    return this.fetch<void>(`/v1/protocol/context-tags/${tagId}`, {
      method: 'DELETE',
    });
  }

  /**
   * List context tags with filters and pagination
   */
  async listContextTags(params: ContextTagsQueryParams): Promise<ContextTagListResponse> {
    const queryParams = new URLSearchParams();
    
    // Use page/page_size to match API endpoint
    const page = params.page || 1;
    const pageSize = params.page_size || params.limit || 50;
    
    queryParams.set('page', page.toString());
    queryParams.set('page_size', pageSize.toString());
    if (params.category) queryParams.set('category', params.category);
    if (params.search) queryParams.set('search', params.search);

    return this.fetch<ContextTagListResponse>(`/v1/protocol/context-tags?${queryParams}`);
  }

  /**
   * Autocomplete context tags based on search query
   */
  async autocompleteContextTags(query: string, limit: number = 10): Promise<ContextTagRead[]> {
    const queryParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });
    return this.fetch<ContextTagRead[]>(`/v1/protocol/context-tags/autocomplete?${queryParams}`);
  }
}
