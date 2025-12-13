/**
 * NLP Client for Rhiz Protocol v0.2.0
 */

import type {
  ParseQueryRequest,
  QueryParseResult,
  FindPathRequest,
  WarmPath,
  IntroductionRequest,
  IntroductionSuggestion,
  RelationshipInsights,
  TagSuggestions,
  OpportunityMatch,
  PersonRead
} from './types'

export interface NlpClientOptions {
  baseUrl: string
  getAccessToken?: () => Promise<string | null>
}

export class NlpClient {
  private baseUrl: string
  private getAccessToken?: () => Promise<string | null>

  constructor(options: NlpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.getAccessToken = options.getAccessToken
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken ? await this.getAccessToken() : null

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Rhiz-App-Id': 'eventmanage',
      'X-Rhiz-Contract-Version': '1.0',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(`API Error ${response.status}: ${error.detail || error.message || response.statusText}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  /**
   * Parse natural language query into structured filters
   */
  async parseQuery(request: ParseQueryRequest): Promise<QueryParseResult> {
    return this.fetch<QueryParseResult>('/v1/nlp/parse-query', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Find warm introduction path between two people
   */
  async findPath(request: FindPathRequest): Promise<WarmPath> {
    return this.fetch<WarmPath>('/v1/nlp/find-path', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Get AI-powered introduction suggestion
   */
  async suggestIntroduction(request: IntroductionRequest): Promise<IntroductionSuggestion> {
    return this.fetch<IntroductionSuggestion>('/v1/nlp/suggest-introduction', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Extract relationship insights from interactions
   */
  async getInsights(personId: string): Promise<RelationshipInsights> {
    return this.fetch<RelationshipInsights>(`/v1/nlp/insights/${personId}`)
  }

  /**
   * Get smart tag suggestions for a person
   */
  async getTags(personId: string): Promise<TagSuggestions> {
    return this.fetch<TagSuggestions>(`/v1/nlp/tags/${personId}`)
  }

  /**
   * Find opportunity matches for a person based on shared context and goals.
   * Currently mocks the response until backend endpoint is active.
   */
  async findOpportunityMatches(): Promise<OpportunityMatch[]> {
      // MOCK IMPLEMENTATION - To be replaced by:
      // return this.fetch<OpportunityMatch[]>('/v1/nlp/opportunities', { method: 'POST', body: JSON.stringify(args) });
      
      return [
      {
        suggestion: {
          match_score: 0.85,
          reasons: ["Both interested in Generative AI", "Complementary Goals: Hiring vs Job Seeking"],
          should_introduce: true,
          intro_message: "You both seem interested in GenAI..."
        },
        candidate: {
          person_id: "opp-1",
          owner_id: "system",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          legal_name: "Sarah Chen",
          preferred_name: "Sarah",
          tags: ["AI", "Startups"]
        } as PersonRead
      },
      {
         suggestion: {
           match_score: 0.65,
           reasons: ["Shared Industry: Fintech", "Attending same workshops"],
           should_introduce: true,
         },
         candidate: {
           person_id: "opp-2",
           owner_id: "system",
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString(),
           legal_name: "David Miller",
           preferred_name: "Dave",
           tags: ["Fintech"]
         } as PersonRead
      }
    ];
  }
}
