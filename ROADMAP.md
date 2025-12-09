# Roadmap

## 1. Rhiz Protocol Application Wiring (Immediate Focus)

The SDK wrappers (`lib/rhizClient.ts`) are implemented. We now need to wire them into the application flow to make the data "live".

- [ ] **Data Ingestion**

  - [x] Call `rhizClient.ingestAttendees` when an event is finalized or loaded, populating the Protocol with the AI-generated attendees.
  - [x] Ensure the current user has a Protocol Identity (`ensureIdentity`).

- [ ] **Live Networking Graph**

  - [x] Fetch real relationships using `rhizClient.getSuggestedConnections`.
  - [x] Update `EventLandingPage` (or a wrapper) to pass this live data to `NetworkingPreview`.
  - [x] Visualize "Edges": connection lines between nodes based on `strength_score`.

- [ ] **Interaction Tracking**
  - [x] Call `rhizClient.recordInteraction` when users click on speakers or attendees.

## 2. Graph Polish & Interactivity

- [x] **Interactive Nodes**: Click avatar to see bio/details (Modal or Popover).
- [x] **Mobile Responsiveness**: Tune orbit radii for mobile screens.
- [x] **Accessibility**: Keyboard navigation for graph nodes.
- [x] **Session Intelligence**: Map schedule to Protocol "Context Tags" to recommend sessions.
- [ ] **Stress Testing**: Add a debug toggle to flood the graph with 50+ mock attendees.

## 3. Production Polish

- [x] **Error Handling**: Graceful fallbacks if Protocol API is down.
- [x] **Loading States**: Skeletons while fetching relationships.
- [x] **Performance**: Verify rendering with 50+ nodes.

## 4. Measurement & ROI (The "Event Intelligence" Dashboard)

Transform the app from an "Event Generator" to an "Event Intelligence Platform" by measuring success against the user's initial goals.

- [ ] **Analytics Dashboard (/dashboard)**

  - **Tech**: Integrated `recharts` for composable, responsive data visualization.
  - **Visuals**: Dark-mode optimized charts with gradient fills and interactive tooltips.
  - **Key Metrics**:
    - **Pipeline Generation**: Estimated deal value created (Simulated based on attendee seniority/role).
    - **Meeting Matrix**: Chord diagram or Matrix heatmap showing cross-pollination (e.g., % of Investors meeting Founders).
    - **Content Resonance**: Bar chart ranking sessions by attendance and "heat" (interactions).

- [ ] **Automated Insights**

  - [ ] **Goal vs. Actuals**: Direct comparison of "Intended Goals" (from config) vs. simulated outcomes.
  - [ ] **Sentiment Stream**: "Vibe Check" gauge based on simulated post-event survey data (NPS).

- [ ] **Executive Reporting**
  - [ ] **"One-Click Recap"**: A specialized view meant to be printed/PDF'd as a summary deck for stakeholders.

## 5. Future / Exploratory

- [ ] **Live "Helper"**: Real-time suggestions based on current user behavior.
- [ ] **3D Visualization**: WebGL or Z-axis depth for larger graphs.
