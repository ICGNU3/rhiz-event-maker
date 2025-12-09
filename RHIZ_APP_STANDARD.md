# The Rhiz App Standard Stack (RASS)

This document defines the standardized architecture and implementation workflow for all applications in the `RhizApp` ecosystem (e.g., `rhiz-event-maker`, `FundRhiz`, `werhiz-identity`).

The goal is to ensure **Data Portability** (like the AT Protocol) while maintaining **High Performance** and **Developer Velocity**.

---

## 🏗️ Architecture Overview

The "Rhiz App Standard Stack" creates a separation of concerns between **Application State** and **Network State**.

### 1. The Global Graph Layer (Source of Truth)

- **Infrastructure**: Rhiz Protocol (on Render/Railway)
- **Database**: Protocol Postgres + Vector Store
- **Role**: Stores **People**, **Relationships**, **Trust Scores**, and **Context Tags**.
- **Access**: **STRICTLY via API / SDK** (`@rhiz/protocol-client`).
- **Why**: Ensures that no single app "owns" the user's identity graph. It is a shared, portable resource.

### 2. The Application Layer (Local State)

- **Infrastructure**: Vercel Serverless
- **Database**: **Vercel Postgres (Neon)**
- **ORM**: **Drizzle**
- **Role**: Stores app-specific data (e.g., Event Drafts, Donation Receipts, UI Preferences).
- **Access**: Direct SQL access via Server Actions.
- **Why**: Provides sub-second latency for UI interactions and zero-maintenance scaling.

### 3. The Identity Layer (Authentication)

- **Provider**: **Clerk**
- **Role**: Handles Multi-Tenancy (Organizations) and User Auth.
- **Integration**: The `auth_user_id` is mapped to the `rhiz_person_id` in the application database.

---

## 🚀 Implementation Workflow (Manual to Automated)

Use this checklist when spinning up a new Rhiz App.

### Phase 1: Infrastructure Setup (The "Sidecar" Pattern)

1.  **Initialize Repo**:

    - Create Next.js app (`npx create-next-app`).
    - Set Git Remote to `RhizApp` organization.

2.  **Provision App Database**:

    - Create a **Vercel Postgres** store in Vercel Dashboard.
    - Pull environment variables (`POSTGRES_URL`, etc.).

3.  **Install The Core Stack**:
    ```bash
    npm install drizzle-orm @vercel/postgres dotenv
    npm install -D drizzle-kit
    ```

### Phase 2: Schema Definition

1.  **Define `lib/db/schema.ts`**:

    - Must include robust typing for App State.
    - **Crucial Rule**: Always include `owner_id` or `rhiz_id` columns to link records back to the Protocol Graph.

2.  **Configure `drizzle.config.ts`**:

    - Point to `POSTGRES_URL`.

3.  **Run Migrations**:
    - `npx drizzle-kit push` (for prototyping) or `generate` (for production).

### Phase 3: The "Wiring" (Connect to Protocol)

1.  **Install Protocol SDK**:

    - Add `@rhiz/protocol-client` (or local `lib/protocol-sdk` if monorepo not yet ready).

2.  **Create The Sync Action**:
    - Every time a major app action occurs (e.g., "Event Published", "Donation Made"), trigger a **dual-write**:
      1.  **Write to App DB**: Storage for the UI (`db.insert(events)...`).
      2.  **Write to Protocol**: Context for the Graph (`rhizClient.ingestInteraction(...)`).

---

## 🤖 Future Automation Goal: `create-rhiz-app`

We aim to build a CLI tool (`npx create-rhiz-app`) that automates this entirely:

1.  **Prompts**: "What is your app name?"
2.  **Actions**:
    - Clones the `rhiz-app-template`.
    - Provisions Vercel Postgres via API (requires Vercel Token).
    - Sets up the `RhizProvider` with default context.
    - Generates the `schema.ts` boilerplate.

---

## 📝 Current Action Item (For `rhiz-event-maker`)

To align the Event Maker with this standard:

1.  [ ] **Switch DB Driver**: Move from `postgres` (generic driver) to `@vercel/postgres` driver.
2.  [ ] **Update Config**: Replace `.env.local` Supabase URL with Vercel Postgres credentials.
3.  [ ] **Deploy**: `git push` to trigger Vercel build.
