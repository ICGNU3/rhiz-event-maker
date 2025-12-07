/**
 * Agents API Client for Rhiz Protocol v0.2.0
 */

import {
  DIDAgentProfile,
  AgentChatRequest,
  AgentChatResponse,
  GoalTaskResponse,
} from './types';

export interface AgentsClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class AgentsClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: AgentsClientOptions) {
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

    return response.json();
  }

  /**
   * Get agent profile for a DID
   */
  async getAgentProfile(did: string): Promise<DIDAgentProfile> {
    return this.fetch<DIDAgentProfile>(`/v1/agents/${encodeURIComponent(did)}/profile`);
  }

  /**
   * Chat with a DID agent
   */
  async chatWithAgent(did: string, request: AgentChatRequest): Promise<AgentChatResponse> {
    return this.fetch<AgentChatResponse>(`/v1/agents/${encodeURIComponent(did)}/chat`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Preview goal task for an agent
   */
  async previewGoalTask(did: string, goalId: string): Promise<GoalTaskResponse> {
    return this.fetch<GoalTaskResponse>(
      `/v1/agents/${encodeURIComponent(did)}/goal-task-preview`,
      {
        method: 'POST',
        body: JSON.stringify({ goal_id: goalId }),
      }
    );
  }
}

