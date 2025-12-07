/**
 * Goals API Client for Rhiz Protocol v0.2.0
 */

import {
  GoalCreate,
  GoalUpdate,
  GoalView,
  GoalListResponse,
  GoalTaskResponse,
  OrchestratedPlan,
  GoalsQueryParams,
} from './types';

export interface GoalsClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class GoalsClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: GoalsClientOptions) {
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
   * Create a new goal
   */
  async createGoal(goal: GoalCreate): Promise<GoalView> {
    return this.fetch<GoalView>('/v1/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  /**
   * Get a goal by ID
   */
  async getGoal(goalId: string): Promise<GoalView> {
    return this.fetch<GoalView>(`/v1/goals/${goalId}`);
  }

  /**
   * Update a goal
   */
  async updateGoal(goalId: string, updates: GoalUpdate): Promise<GoalView> {
    return this.fetch<GoalView>(`/v1/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * List goals with filters and pagination
   */
  async listGoals(params?: GoalsQueryParams): Promise<GoalListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.owner_person_id) queryParams.set('owner_person_id', params.owner_person_id);
      if (params.status) queryParams.set('status', params.status);
      if (params.type) queryParams.set('type', params.type);
      if (params.priority) queryParams.set('priority', params.priority);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.offset) queryParams.set('offset', params.offset.toString());
      if (params.sort_by) queryParams.set('sort_by', params.sort_by);
      if (params.sort_order) queryParams.set('sort_order', params.sort_order);
    }

    const queryString = queryParams.toString();
    return this.fetch<GoalListResponse>(`/v1/goals${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Orchestrate a goal (generate execution plan)
   */
  async orchestrateGoal(goalId: string): Promise<OrchestratedPlan> {
    return this.fetch<OrchestratedPlan>(`/v1/goals/${goalId}/orchestrate`, {
      method: 'POST',
    });
  }

  /**
   * Start MDAP process for a goal
   */
  async startMDAP(goalId: string): Promise<{ process_id: string; message: string }> {
    return this.fetch<{ process_id: string; message: string }>(`/v1/goals/${goalId}/start-mdap`, {
      method: 'POST',
    });
  }
}

