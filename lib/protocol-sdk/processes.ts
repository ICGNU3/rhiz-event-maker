/**
 * MDAP Processes API Client for Rhiz Protocol v0.2.0
 */

import {
  ProcessCreate,
  ProcessUpdate,
  ProcessView,
  ProcessListResponse,
  ProcessDetailResponse,
  ProcessStepCreate,
  ProcessStepView,
  ProcessExecutionRequest,
  ProcessExecutionResponse,
  ProcessesQueryParams,
} from './types';

export interface ProcessesClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class ProcessesClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: ProcessesClientOptions) {
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
   * Create a new MDAP process
   */
  async createProcess(process: ProcessCreate): Promise<ProcessView> {
    return this.fetch<ProcessView>('/v1/agentic/processes', {
      method: 'POST',
      body: JSON.stringify(process),
    });
  }

  /**
   * Get a process by ID
   */
  async getProcess(processId: string): Promise<ProcessDetailResponse> {
    return this.fetch<ProcessDetailResponse>(`/v1/agentic/processes/${processId}`);
  }

  /**
   * Update a process
   */
  async updateProcess(processId: string, updates: ProcessUpdate): Promise<ProcessView> {
    return this.fetch<ProcessView>(`/v1/agentic/processes/${processId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * List processes with filters and pagination
   */
  async listProcesses(params?: ProcessesQueryParams): Promise<ProcessListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.owner_person_id) queryParams.set('owner_person_id', params.owner_person_id);
      if (params.goal_id) queryParams.set('goal_id', params.goal_id);
      if (params.process_type) queryParams.set('process_type', params.process_type);
      if (params.status) queryParams.set('status', params.status);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.offset) queryParams.set('offset', params.offset.toString());
      if (params.sort_by) queryParams.set('sort_by', params.sort_by);
      if (params.sort_order) queryParams.set('sort_order', params.sort_order);
    }

    const queryString = queryParams.toString();
    return this.fetch<ProcessListResponse>(`/v1/agentic/processes${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Add a step to a process
   */
  async addProcessStep(processId: string, step: ProcessStepCreate): Promise<ProcessStepView> {
    return this.fetch<ProcessStepView>(`/v1/agentic/processes/${processId}/steps`, {
      method: 'POST',
      body: JSON.stringify(step),
    });
  }

  /**
   * Execute a process step
   */
  async executeStep(stepId: string, request?: ProcessExecutionRequest): Promise<ProcessExecutionResponse> {
    return this.fetch<ProcessExecutionResponse>(`/v1/agentic/processes/steps/${stepId}/execute`, {
      method: 'POST',
      body: request ? JSON.stringify(request) : undefined,
    });
  }

  /**
   * Get a process step by ID
   */
  async getStep(stepId: string): Promise<ProcessStepView> {
    return this.fetch<ProcessStepView>(`/v1/agentic/processes/steps/${stepId}`);
  }
}

