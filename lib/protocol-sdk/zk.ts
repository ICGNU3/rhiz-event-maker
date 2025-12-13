/**
 * Zero Knowledge Client for Rhiz Protocol
 */

import {
  ZKVerificationKeyCreate,
  ZKVerificationKeyRead,
  ZKProofVerifyRequest,
  ZKVerifyResponse
} from './types';

export interface ZkClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

export class ZkClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;

  constructor(options: ZkClientOptions) {
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
   * Register a new verification key
   */
  async registerKey(params: ZKVerificationKeyCreate): Promise<ZKVerificationKeyRead> {
    return this.fetch<ZKVerificationKeyRead>('/v1/zk/keys', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get a verification key by ID
   */
  async getKey(vkId: string): Promise<ZKVerificationKeyRead> {
    return this.fetch<ZKVerificationKeyRead>(`/v1/zk/keys/${vkId}`);
  }

  /**
   * Verify a ZK Proof
   */
  async verifyProof(params: ZKProofVerifyRequest): Promise<ZKVerifyResponse> {
    return this.fetch<ZKVerifyResponse>('/v1/zk/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}
