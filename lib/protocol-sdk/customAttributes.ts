/**
 * Custom Attributes API Client for Rhiz Protocol v0.3.0
 */

import {
  CustomAttributeCreate,
  CustomAttributeRead,
  CustomAttributeUpdate,
  CustomAttributeListResponse,
  CustomAttributesQueryParams,
} from './types';

export interface CustomAttributesClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class CustomAttributesClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: CustomAttributesClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/?$/, '');
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
   * Create a new custom attribute
   */
  async createCustomAttribute(attribute: CustomAttributeCreate): Promise<CustomAttributeRead> {
    return this.fetch<CustomAttributeRead>('/v1/protocol/custom-attribute', {
      method: 'POST',
      body: JSON.stringify(attribute),
    });
  }

  /**
   * Get a custom attribute by ID
   */
  async getCustomAttribute(attributeId: string): Promise<CustomAttributeRead> {
    return this.fetch<CustomAttributeRead>(`/v1/protocol/custom-attributes/${attributeId}`);
  }

  /**
   * Update a custom attribute
   */
  async updateCustomAttribute(
    attributeId: string,
    updates: CustomAttributeUpdate
  ): Promise<CustomAttributeRead> {
    return this.fetch<CustomAttributeRead>(`/v1/protocol/custom-attributes/${attributeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a custom attribute
   */
  async deleteCustomAttribute(attributeId: string): Promise<void> {
    return this.fetch<void>(`/v1/protocol/custom-attributes/${attributeId}`, {
      method: 'DELETE',
    });
  }

  /**
   * List custom attributes with filters and pagination
   */
  async listCustomAttributes(params?: CustomAttributesQueryParams): Promise<CustomAttributeListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      // Use page/page_size to match API endpoint
      const page = params.page || 1;
      const pageSize = params.page_size || params.limit || 50;

      queryParams.set('page', page.toString());
      queryParams.set('page_size', pageSize.toString());
      
      if (params.entity_type) queryParams.set('entity_type', params.entity_type);
      if (params.entity_id) queryParams.set('entity_id', params.entity_id);
      if (params.attribute_key) queryParams.set('attribute_key', params.attribute_key);
      if (params.search) queryParams.set('search', params.search);
    } else {
      queryParams.set('page', '1');
      queryParams.set('page_size', '50');
    }

    return this.fetch<CustomAttributeListResponse>(`/v1/protocol/custom-attributes?${queryParams}`);
  }

  /**
   * Search custom attributes by various criteria
   */
  async searchCustomAttributes(params: {
    entity_type?: string;
    entity_id?: string;
    attribute_key?: string;
    value_query?: string;
  }): Promise<CustomAttributeListResponse> {
    const queryParams = new URLSearchParams();

    if (params.entity_type) queryParams.set('entity_type', params.entity_type);
    if (params.entity_id) queryParams.set('entity_id', params.entity_id);
    if (params.attribute_key) queryParams.set('attribute_key', params.attribute_key);
    if (params.value_query) queryParams.set('value_query', params.value_query);

    return this.fetch<CustomAttributeListResponse>(
      `/v1/protocol/custom-attributes/search?${queryParams}`
    );
  }
}
