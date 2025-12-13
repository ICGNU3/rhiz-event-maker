/**
 * Rhiz Protocol TypeScript SDK v0.4.3
 * 
 * Complete client library for the Rhiz Protocol API
 * App Launch Contract v1 compliant
 */

// Main client
export { RhizClient } from './client';
export type { RhizClientOptions } from './client';

// Contract-compliant clients (core & optional)
export { PeopleClient } from './people';
export type { PeopleClientOptions } from './people';

export { OrganizationsClient } from './organizations';
export type { OrganizationsClientOptions } from './organizations';

export { GoalsClient } from './goals';
export type { GoalsClientOptions } from './goals';

export { NlpClient } from './nlp';
export type { NlpClientOptions } from './nlp';

export { ChannelsClient } from './channels';
export type { ChannelsClientOptions } from './channels';

export { ContextTagsClient } from './contextTags';
export type { ContextTagsClientOptions } from './contextTags';

export { CustomAttributesClient } from './customAttributes';
export type { CustomAttributesClientOptions } from './customAttributes';

// All types
export * from './types';

// Identity helper for identity resolution workflows
export { IdentityHelper } from './identity';

// =====================================================
// INTERNAL CLIENTS - Gated by environment variable
// =====================================================
// These clients access internal endpoints not part of 
// App Launch Contract v1. Use with caution.
// =====================================================

const ENABLE_INTERNAL = 
  process.env.ENABLE_INTERNAL_ENDPOINTS === 'true' || 
  process.env.NODE_ENV === 'development';

// Conditionally export internal clients
// In production, these will be undefined unless explicitly enabled
export const __internal = ENABLE_INTERNAL ? {
  get ProcessesClient() { return require('./processes').ProcessesClient; },
  get AgentsClient() { return require('./agents').AgentsClient; },
  get ZkClient() { return require('./zk').ZkClient; },
  get HealthClient() { return require('./health').HealthClient; },
} : undefined;

// Legacy exports - kept for backward compatibility but deprecated
/** @deprecated Use __internal.AgentsClient instead - internal endpoint */
export { AgentsClient } from './agents';
export type { AgentsClientOptions } from './agents';

/** @deprecated Use __internal.ProcessesClient instead - internal endpoint */
export { ProcessesClient } from './processes';
export type { ProcessesClientOptions } from './processes';

/** @deprecated Use __internal.ZkClient instead - internal endpoint */
export { ZkClient } from './zk';
export type { ZkClientOptions } from './zk';
