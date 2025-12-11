# Strategic Roadmap: The GatherX Execution Plan

**Objective:** Transform from "Event Builder" to "The Identity Layer for Events."
**Focus:** Speed, Simplicity, Intelligence.
**Context:** GatherX is the App. Rhiz is the Protocol.

---

## 1. THE LUMA KILLER: "Instant Launch" Flow (Priority: CRITICAL)

_Target: Free Tier / Viral Growth_

- [x] **The "3-Field" Creator**
  - Build a simplified `CreateEventModal` for GatherX that bypasses the complex Wizard.
  - Inputs: Title, Date/Time, Location.
  - Action: Generates a published URL (e.g. `gatherx.io/e/...`) immediately using a default "Glass" template.
- [x] **The "Luma Import" Tool**
  - Input field: "Paste Luma/Eventbrite URL".
  - Backend: Scrape OG tags and schema.org data to pre-fill the "3-Field" creator.
- [ ] **Viral "Clone" Loop**
  - Update Footer on all Free Events: "Powered by GatherX – Host your own."
  - Action: Clicking "Host your own" opens the 3-Field Creator _overlaying_ the current page.

## 2. THE REVENUE ENGINE: "Studio Mode" Gates

_Target: Pro Tier / Monetization_

- [ ] **Visual Paywalls**
  - Show "Edit Layout," "add Page," and "Custom Domain" buttons in the builder UI.
  - Action: Clicking them triggers the `UpgradePlanModal`.
- [ ] **The "Architect" Lock**
  - Refactor `RhizCanvas` (the site builder) to have a `readOnly` mode for Free users.
  - Allow them to _see_ the complexity they are missing.

## 3. THE MOAT: Rhiz Protocol Wiring

_Target: Sticky Value_

- [ ] **Invisible Wallet (Account Abstraction)**
  - Ensure Clerk Auth maps to a backend **Rhiz Identity** (DID) without prompting for MetaMask/WalletConnect.
  - _Constraint:_ "Crypto" must be invisible to the user.
- [ ] **"Warm Start" Data Injection**
  - Build a job to query public social graphs (Farcaster/Lens) based on email/handle.
  - Goal: Ensure `getSuggestedConnections` returns >0 results for new users.
- [x] **The "Graph" Component Polish**
  - Finalize `NetworkingGraph` visualization.
  - Must feel "alive" (physics-based, breathing animations).

## 4. GROWTH & VIRAL: Lessons from Luma/Partiful

_Target: Conversion & Network Effects_

- [ ] **"Smart Approval" Gates (The Luma Flex)**
  - Implement `create-gate` logic in `EventAppConfig`.
  - Feature: Auto-approve guests based on **Trust Score** (>50) or **Vouching** (Followed by Speaker).
  - UI: "Request to Join" button (replacing "Register") for gated events.
- [x] **"Guest List" Preview (The FOMO Hook)**
  - Expose a readonly version of the `NetworkingGraph` on the **Registration Page**.
  - Logic: Show "Join 45 builders including [Avatar]..." _before_ sign-up.
  - Goal: Use social proof to drive conversion.
- [ ] **Event Chat (The Partiful Loop)**
  - Implement a "Lobby" chat using Matrix/XMTP.
  - Feature: Verified attendees can "Wave" or message the group.
  - Goal: Move communication from email (slow) to instant (sticky).

## 5. ANALYTICS: From "Data" to "Insights"

_Target: Retention_

- [ ] **Dashboard Upgrade**
  - Replace generic stats with "Relationship Metrics."
  - _Metric:_ "Total New Connections Made."
  - _Metric:_ "Highest Value Intro."
- [ ] **Sponsor ROI View**
  - Track "Logo Impressions" and "Profile Clicks" for flagged Sponsor profiles.

## 6. INFRASTRUCTURE & COMPLIANCE

- [ ] **"Kill Switch" (GDPR)**
  - Implement a "Delete My Graph Data" button in User Settings.
  - Ensure it wipes the Protocol mapping (or delinks the DID).

---

## EXECUTION ORDER

1.  **Phase 1 (Week 1):** Build the "3-Field Creator" & Luma Import for GatherX. (Growth)
2.  **Phase 2 (Week 2):** Implement the "Invisible Wallet" & Graph Polish for Rhiz Protocol. (Retention)
3.  **Phase 3 (Week 3):** Erect the "Studio Mode" Paywalls. (Revenue)
