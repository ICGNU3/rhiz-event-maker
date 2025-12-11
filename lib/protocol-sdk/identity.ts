import { PeopleClient, PersonCreate } from "./people";
// import { PersonRead } from "./types";

interface ResolveIdentityArgs {
  email?: string;
  name?: string;
  externalUserId?: string;
  tags?: string[];
  avatarUrl?: string;
  ownerId: string;
}

interface IdentityResult {
  id: string;
  externalUserId?: string;
  did?: string;
  handle?: string;
  isNew: boolean;
}

export class IdentityHelper {
  private peopleClient: PeopleClient;

  constructor(config: { baseUrl: string; getAccessToken: () => Promise<string | null> }) {
    this.peopleClient = new PeopleClient(config);
  }

  /**
   * Resolves an external identity (e.g. from Clerk/Auth0) to a Rhiz Protocol Identity (DID).
   * Strategy:
   * 1. Search by verified email.
   * 2. If found -> Return Identity.
   * 3. If not found -> Create new Person -> Return Identity.
   */
  async resolveIdentity(args: ResolveIdentityArgs): Promise<IdentityResult> {
    try {
      // 1. Try to find existing person by email
      if (args.email) {
        try {
          const existing = await this.peopleClient.listPeople({
            owner_id: args.ownerId,
            email: args.email,
            limit: 1,
          });

          if (existing.people.length > 0) {
            const person = existing.people[0];
            return {
              id: person.person_id,
              externalUserId: args.externalUserId,
              did: person.did,
              handle: person.handle,
              isNew: false
            };
          }
        } catch (searchError) {
          console.warn("Rhiz SDK: Identity search failed, proceeding to creation", searchError);
        }
      }

      // 2. Create new person if not found
      const personData: PersonCreate = {
        owner_id: args.ownerId,
        legal_name: args.name || args.email || "Anonymous User",
        preferred_name: args.name,
        emails: args.email ? [args.email] : [],
        tags: args.tags || [],
        social_handles: args.avatarUrl ? { avatar: args.avatarUrl } : undefined,
      };

      // We explicitly DO NOT handle timeouts here, letting the caller or the base client handle it.
      // However, for robustness in this helper, we assume the base client handles basic networking.
      
      const person = await this.peopleClient.createPerson(personData);

      return {
        id: person.person_id,
        externalUserId: args.externalUserId,
        did: person.did,
        handle: person.handle,
        isNew: true
      };

    } catch (error) {
      console.error("Rhiz SDK: Failed to resolve identity", error);
      throw error;
    }
  }
}
