import {
  InteractionCreate,
  InteractionResponse,
  RelationshipSummary,
  RelationshipDetail,
  RelationshipListResponse,
  InteractionListResponse,
  TrustEventListResponse,
  RelationshipsQueryParams,
} from './types';

export interface RhizClientOptions {
  baseUrl?: string;
  getAccessToken?: () => Promise<string | null>;
}

/**
 * Rhiz Protocol TypeScript Client
 * 
 * A lightweight client for interacting with the Rhiz Protocol API.
 * 
 * @version 0.2.0
 */
export class RhizClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: RhizClientOptions = {}) {
    this.baseUrl = (options.baseUrl || 'http://localhost:8000').replace(/\/$/, '');
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
   * Log an interaction and update relationship trust
   */
  async logInteraction(payload: InteractionCreate): Promise<InteractionResponse> {
    return this.fetch<InteractionResponse>('/v1/protocol/interaction', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get relationship summary between two people
   */
  async getRelationshipSummary(params: {
    owner_id: string;
    source_person_id: string;
    target_person_id: string;
  }): Promise<RelationshipSummary> {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return this.fetch<RelationshipSummary>(`/v1/protocol/relationship-summary?${queryParams}`);
  }

  /**
   * Get a single relationship by ID
   */
  async getRelationship(relationshipId: string, ownerId: string): Promise<RelationshipDetail> {
    const params = new URLSearchParams({ owner_id: ownerId });
    return this.fetch<RelationshipDetail>(`/v1/protocol/relationship/${relationshipId}?${params}`);
  }

  /**
   * List relationships with filters and pagination
   */
  async listRelationships(params: RelationshipsQueryParams): Promise<RelationshipListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.set('owner_id', params.owner_id);
    
    if (params.person_id) queryParams.set('person_id', params.person_id);
    if (params.source_person_id) queryParams.set('source_person_id', params.source_person_id);
    if (params.target_person_id) queryParams.set('target_person_id', params.target_person_id);
    if (params.min_strength !== undefined) queryParams.set('min_strength', params.min_strength.toString());
    if (params.relationship_state) queryParams.set('relationship_state', params.relationship_state);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());
    if (params.sort_by) queryParams.set('sort_by', params.sort_by);
    if (params.sort_order) queryParams.set('sort_order', params.sort_order);

    return this.fetch<RelationshipListResponse>(`/v1/protocol/relationships?${queryParams}`);
  }

  /**
   * Get interactions for a relationship
   */
  async getRelationshipInteractions(
    relationshipId: string,
    ownerId: string,
    limit?: number,
    offset?: number
  ): Promise<InteractionListResponse> {
    const queryParams = new URLSearchParams({ owner_id: ownerId });
    if (limit) queryParams.set('limit', limit.toString());
    if (offset) queryParams.set('offset', offset.toString());

    return this.fetch<InteractionListResponse>(
      `/v1/protocol/relationship/${relationshipId}/interactions?${queryParams}`
    );
  }

  /**
   * Get trust events for a relationship
   */
  async getRelationshipTrustEvents(
    relationshipId: string,
    ownerId: string,
    limit?: number,
    offset?: number
  ): Promise<TrustEventListResponse> {
    const queryParams = new URLSearchParams({ owner_id: ownerId });
    if (limit) queryParams.set('limit', limit.toString());
    if (offset) queryParams.set('offset', offset.toString());

    return this.fetch<TrustEventListResponse>(
      `/v1/protocol/relationship/${relationshipId}/trust-events?${queryParams}`
    );
  }
}

export * from './types';
