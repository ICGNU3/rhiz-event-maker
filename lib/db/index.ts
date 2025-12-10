import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";
import * as schema from './schema';

// Safely initialize DB to avoid crashes if env vars are missing (e.g. during build or demo)
export const db = (process.env.POSTGRES_URL || process.env.DATABASE_URL) 
  ? drizzle(sql, { schema }) 
  : {} as any; // Cast to any to avoid complex type mocking, handled by usage checks
