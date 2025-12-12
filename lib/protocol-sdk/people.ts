/**
 * People API Client for Rhiz Protocol v0.2.0
 */

import {
  PersonCreate,
  PersonRead,
  PersonUpdate,
  PersonListResponse,
  PersonBulkResponse,
  PersonBulkResponse,
  OrganizationMembershipCreate,
  OrganizationMembershipRead,
  PeopleQueryParams,
} from './types';

// Re-export for convenience
export type { PersonCreate };

export interface PeopleClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class PeopleClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: PeopleClientOptions) {
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
   * Create a new person
   */
  async createPerson(person: PersonCreate): Promise<PersonRead> {
    return this.fetch<PersonRead>('/v1/protocol/people', {
      method: 'POST',
      body: JSON.stringify(person),
    });
  }

  /**
   * Get a person by ID
   */
  async getPerson(personId: string, ownerId: string): Promise<PersonRead> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<PersonRead>(`/v1/protocol/people/${personId}?${params}`);
  }

  /**
   * Update a person
   */
  async updatePerson(
    personId: string,
    updates: PersonUpdate,
    ownerId: string
  ): Promise<PersonRead> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<PersonRead>(`/v1/protocol/people/${personId}?${params}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a person (soft delete)
   */
  async deletePerson(personId: string, ownerId: string): Promise<void> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<void>(`/v1/protocol/people/${personId}?${params}`, {
      method: 'DELETE',
    });
  }

  /**
   * List people with filters and pagination
   */
  async listPeople(params: PeopleQueryParams): Promise<PersonListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.set('owner_id', params.owner_id);
    
    if (params.name) queryParams.set('name', params.name);
    if (params.email) queryParams.set('email', params.email);
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());
    if (params.sort_by) queryParams.set('sort_by', params.sort_by);
    if (params.sort_order) queryParams.set('sort_order', params.sort_order);

    return this.fetch<PersonListResponse>(`/v1/protocol/people?${queryParams}`);
  }

  /**
   * Resolve an identity by handle, email, or wallet address.
   */
  async resolveIdentity(query: string): Promise<PersonRead> {
    const params = new URLSearchParams({ query });
    return this.fetch<PersonRead>(`/v1/protocol/people/resolve?${params}`);
  }

  /**
   * Bulk create people
   */
  async bulkCreatePeople(people: PersonCreate[]): Promise<PersonBulkResponse> {
    return this.fetch<PersonBulkResponse>('/v1/protocol/people/bulk', {
      method: 'POST',
      body: JSON.stringify(people),
    });
  }

  /**
   * Add a person to an organization
   */
  async addPersonToOrganization(
    personId: string,
    membership: OrganizationMembershipCreate,
    ownerId: string
  ): Promise<OrganizationMembershipRead> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<OrganizationMembershipRead>(
      `/v1/protocol/people/${personId}/organizations?${params}`,
      {
        method: 'POST',
        body: JSON.stringify(membership),
      }
    );
  }

  /**
   * Remove a person from an organization
   */
  async removePersonFromOrganization(
    personId: string,
    organizationId: string,
    ownerId: string
  ): Promise<void> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<void>(
      `/v1/protocol/people/${personId}/organizations/${organizationId}?${params}`,
      {
        method: 'DELETE',
      }
    );
  }
}

