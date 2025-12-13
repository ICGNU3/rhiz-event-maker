/**
 * Internal Protocol SDK Clients
 * 
 * These clients access internal/unstable endpoints that are NOT part of the
 * App Launch Contract v1. They should only be used in development or with
 * explicit opt-in via ENABLE_INTERNAL_ENDPOINTS=true.
 * 
 * @internal
 */

// Re-export internal clients for development use
export { ProcessesClient } from '../processes';
export type { ProcessesClientOptions } from '../processes';

export { AgentsClient } from '../agents';
export type { AgentsClientOptions } from '../agents';

export { ZkClient } from '../zk';
export type { ZkClientOptions } from '../zk';

// Health/Intelligence endpoints
export { HealthClient } from '../health';
export type { HealthClientOptions } from '../health';

/**
 * Check if internal endpoints are enabled
 */
export function isInternalEnabled(): boolean {
  return process.env.ENABLE_INTERNAL_ENDPOINTS === 'true' || 
         process.env.NODE_ENV === 'development';
}

/**
 * Assert that internal endpoints are enabled, throw otherwise
 */
export function assertInternalEnabled(): void {
  if (!isInternalEnabled()) {
    throw new Error(
      'Internal protocol endpoints are disabled in production. ' +
      'Set ENABLE_INTERNAL_ENDPOINTS=true to enable them.'
    );
  }
}
