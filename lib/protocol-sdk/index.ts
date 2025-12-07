/**
 * Rhiz Protocol TypeScript SDK v0.2.0
 * 
 * Complete client library for the Rhiz Protocol API
 */

// Main client
export { RhizClient, RhizClientOptions } from './client';

// Feature-specific clients
export { PeopleClient, PeopleClientOptions } from './people';
export { OrganizationsClient, OrganizationsClientOptions } from './organizations';
export { GoalsClient, GoalsClientOptions } from './goals';
export { AgentsClient, AgentsClientOptions } from './agents';
export { ProcessesClient, ProcessesClientOptions } from './processes';
export { ChannelsClient, ChannelsClientOptions } from './channels';
export { ContextTagsClient, ContextTagsClientOptions } from './contextTags';
export { CustomAttributesClient, CustomAttributesClientOptions } from './customAttributes';

// All types
export * from './types';

// Note: Identity client is in sdk/identity.ts (separate file)
// Import it directly: import { IdentityClient } from '@rhiz/protocol-sdk/identity'
