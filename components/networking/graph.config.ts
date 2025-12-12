/**
 * Graph Visualization Configuration
 * Centralized constants for the networking graph system
 */

export const GRAPH_CONFIG = {
  /** Breakpoint for mobile/desktop switch (pixels) */
  mobileBreakpoint: 768,

  mobile: {
    /** Orbit radii in pixels [inner, middle, outer] */
    orbits: [60, 110, 160] as const,
    /** Maximum nodes to display */
    maxNodes: 20,
    /** Node avatar size in pixels */
    nodeSize: 32,
  },

  desktop: {
    /** Orbit radii in pixels [inner, middle, outer] */
    orbits: [100, 200, 300] as const,
    /** Maximum nodes to display */
    maxNodes: 50,
    /** Node avatar size in pixels */
    nodeSize: 48,
  },

  /** Orbit distribution percentages [inner, middle, outer] - must sum to 1 */
  orbitDistribution: [0.2, 0.35, 0.45] as const,

  /** Minimum nodes to display (fills with placeholders if needed) */
  minNodes: 15,

  animation: {
    /** Orbit rotation durations in seconds [inner, middle, outer] */
    orbitSpeeds: [60, 90, 120] as const,
    /** Node float duration range [min, max] in seconds */
    floatDuration: [3.2, 6.8] as const,
    /** Stagger delay between node appearances in seconds */
    staggerDelay: 0.05,
    /** Entry animation duration in seconds */
    entryDuration: 1.2,
  },

  edges: {
    /** Minimum strength score to render an edge */
    minStrength: 0,
    /** Strength threshold for animated pulse effect */
    pulseThreshold: 0.5,
  },

  accessibility: {
    /** Minimum font size for labels (px) */
    minLabelFontSize: 12,
  },
} as const;

export type GraphConfig = typeof GRAPH_CONFIG;
