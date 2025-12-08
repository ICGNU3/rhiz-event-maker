# Roadmap

## 1. Rhiz Protocol Application Wiring (Immediate Focus)

The SDK wrappers (`lib/rhizClient.ts`) are implemented. We now need to wire them into the application flow to make the data "live".

- [ ] **Data Ingestion**

  - [x] Call `rhizClient.ingestAttendees` when an event is finalized or loaded, populating the Protocol with the AI-generated attendees.
  - [ ] Ensure the current user has a Protocol Identity (`ensureIdentity`).

- [ ] **Live Networking Graph**

  - [ ] Fetch real relationships using `rhizClient.getSuggestedConnections`.
  - [x] Update `EventLandingPage` (or a wrapper) to pass this live data to `NetworkingPreview`.
  - [x] Visualize "Edges": connection lines between nodes based on `strength_score`.

- [ ] **Interaction Tracking**
  - [x] Call `rhizClient.recordInteraction` when users click on speakers or attendees.

## 2. Graph Polish & Interactivity

- [ ] **Interactive Nodes**: Click avatar to see bio/details (Modal or Popover).
- [ ] **Mobile Responsiveness**: Tune orbit radii for mobile screens.
- [ ] **Accessibility**: Keyboard navigation for graph nodes.

## 3. Production Polish

- [ ] **Error Handling**: Graceful fallbacks if Protocol API is down.
- [ ] **Loading States**: Skeletons while fetching relationships.
- [ ] **Performance**: Verify rendering with 50+ nodes.

## 4. Future / Exploratory

- [ ] **Live "Helper"**: Real-time suggestions based on current user behavior.
- [ ] **3D Visualization**: WebGL or Z-axis depth for larger graphs.
