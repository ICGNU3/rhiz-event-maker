/**
 * Organizations API Client for Rhiz Protocol v0.2.0
 */

import {
  OrganizationCreate,
  OrganizationRead,
  OrganizationUpdate,
  OrganizationListResponse,
  OrganizationsQueryParams,
} from './types';

export interface OrganizationsClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class OrganizationsClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: OrganizationsClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getAccessToken = options.getAccessToken;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken ? await this.getAccessToken() : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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
   * Create a new organization
   */
  async createOrganization(organization: OrganizationCreate): Promise<OrganizationRead> {
    return this.fetch<OrganizationRead>('/v1/protocol/organizations', {
      method: 'POST',
      body: JSON.stringify(organization),
    });
  }

  /**
   * Get an organization by ID
   */
  async getOrganization(organizationId: string, ownerId: string): Promise<OrganizationRead> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<OrganizationRead>(`/v1/protocol/organizations/${organizationId}?${params}`);
  }

  /**
   * Update an organization
   */
  async updateOrganization(
    organizationId: string,
    updates: OrganizationUpdate,
    ownerId: string
  ): Promise<OrganizationRead> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<OrganizationRead>(`/v1/protocol/organizations/${organizationId}?${params}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete an organization (soft delete)
   */
  async deleteOrganization(organizationId: string, ownerId: string): Promise<void> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<void>(`/v1/protocol/organizations/${organizationId}?${params}`, {
      method: 'DELETE',
    });
  }

  /**
   * List organizations with filters and pagination
   */
  async listOrganizations(params: OrganizationsQueryParams): Promise<OrganizationListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.set('owner_id', params.owner_id);
    
    if (params.name) queryParams.set('name', params.name);
    if (params.sector_tags) {
      params.sector_tags.forEach(tag => queryParams.append('sector_tags', tag));
    }
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());
    if (params.sort_by) queryParams.set('sort_by', params.sort_by);
    if (params.sort_order) queryParams.set('sort_order', params.sort_order);

    return this.fetch<OrganizationListResponse>(`/v1/protocol/organizations?${queryParams}`);
  }
}

