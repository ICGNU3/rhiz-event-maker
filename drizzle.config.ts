import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const config = {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL!,
  },
};

export default config;
