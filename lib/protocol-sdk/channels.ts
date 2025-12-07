/**
 * Channels API Client for Rhiz Protocol v0.3.0
 */

import {
  ChannelCreate,
  ChannelRead,
  ChannelUpdate,
  ChannelListResponse,
  ChannelEffectivenessResponse,
  ChannelROIResponse,
  OptimalTimingResponse,
  AllChannelsAnalyticsResponse,
  ChannelsQueryParams,
} from './types';

export interface ChannelsClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class ChannelsClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: ChannelsClientOptions) {
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
   * Create a new channel
   */
  async createChannel(channel: ChannelCreate): Promise<ChannelRead> {
    return this.fetch<ChannelRead>('/v1/protocol/channel', {
      method: 'POST',
      body: JSON.stringify(channel),
    });
  }

  /**
   * Get a channel by ID
   */
  async getChannel(channelId: string): Promise<ChannelRead> {
    return this.fetch<ChannelRead>(`/v1/protocol/channel/${channelId}`);
  }

  /**
   * Update a channel
   */
  async updateChannel(channelId: string, updates: ChannelUpdate): Promise<ChannelRead> {
    return this.fetch<ChannelRead>(`/v1/protocol/channel/${channelId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string): Promise<void> {
    return this.fetch<void>(`/v1/protocol/channel/${channelId}`, {
      method: 'DELETE',
    });
  }

  /**
   * List channels with filters and pagination
   */
  async listChannels(params: ChannelsQueryParams): Promise<ChannelListResponse> {
    const queryParams = new URLSearchParams();
    
    // Use page/page_size to match API endpoint
    const page = params.page || 1;
    const pageSize = params.page_size || params.limit || 50;
    
    queryParams.set('page', page.toString());
    queryParams.set('page_size', pageSize.toString());
    if (params.search) queryParams.set('search', params.search);

    return this.fetch<ChannelListResponse>(`/v1/protocol/channels?${queryParams}`);
  }

  /**
   * Get channel effectiveness metrics
   */
  async getChannelEffectiveness(
    channelId: string,
    relationshipId?: string
  ): Promise<ChannelEffectivenessResponse> {
    const queryParams = new URLSearchParams();
    if (relationshipId) {
      queryParams.set('relationship_id', relationshipId);
    }
    const query = queryParams.toString();
    return this.fetch<ChannelEffectivenessResponse>(
      `/v1/protocol/channel/${channelId}/effectiveness${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get channel ROI metrics
   */
  async getChannelROI(channelId: string): Promise<ChannelROIResponse> {
    return this.fetch<ChannelROIResponse>(`/v1/protocol/channel/${channelId}/roi`);
  }

  /**
   * Get optimal timing analysis for a channel
   */
  async getOptimalTiming(channelId: string): Promise<OptimalTimingResponse> {
    return this.fetch<OptimalTimingResponse>(`/v1/protocol/channel/${channelId}/timing`);
  }

  /**
   * Get aggregate analytics for all channels
   */
  async getAllChannelsAnalytics(): Promise<AllChannelsAnalyticsResponse> {
    return this.fetch<AllChannelsAnalyticsResponse>('/v1/protocol/channels/analytics');
  }
}
