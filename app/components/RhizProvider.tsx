"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { rhizClient } from "@/lib/rhizClient";

interface RhizContextType {
  identityId: string | null;
  did: string | null;
  isLoading: boolean;
  error: Error | null;
  ensureIdentity: (email?: string, name?: string) => Promise<string>;
  refetch: () => Promise<void>;
}

const RhizContext = createContext<RhizContextType | undefined>(undefined);

export function RhizProvider({ children }: { children: ReactNode }) {
  const [identityId, setIdentityId] = useState<string | null>(null);
  const [did, setDid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const ensureIdentity = async (email?: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check localStorage first for cached identity
      const storedId = typeof window !== 'undefined' ? localStorage.getItem("rhiz_identity_id") : null;
      const storedDid = typeof window !== 'undefined' ? localStorage.getItem("rhiz_did") : null;
      
      if (storedId && !email && !name) {
        // Use cached identity if no new credentials provided
        setIdentityId(storedId);
        setDid(storedDid);
        setIsLoading(false);
        return storedId;
      }

      // Call real Rhiz SDK
      const result = await rhizClient.ensureIdentity({ 
        email, 
        name,
        externalUserId: storedId || undefined 
      });
      
      setIdentityId(result.id);
      setDid(result.did || null);
      
      // Cache in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("rhiz_identity_id", result.id);
        if (result.did) {
          localStorage.setItem("rhiz_did", result.did);
        }
      }
      
      return result.id;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to ensure Rhiz identity:", errorObj);
      setError(errorObj);
      
      // Return a fallback local ID so app doesn't break
      const fallbackId = "local_" + Math.random().toString(36).substring(7);
      setIdentityId(fallbackId);
      return fallbackId;
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await ensureIdentity();
  };

  useEffect(() => {
    // Attempt to load cached identity on mount
    ensureIdentity();
  }, []);

  return (
    <RhizContext.Provider value={{ identityId, did, isLoading, error, ensureIdentity, refetch }}>
      {children}
    </RhizContext.Provider>
  );
}

export function useRhiz() {
  const context = useContext(RhizContext);
  if (context === undefined) {
    throw new Error("useRhiz must be used within a RhizProvider");
  }
  return context;
}
