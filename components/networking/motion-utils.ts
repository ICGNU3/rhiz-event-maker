import { Transition } from "framer-motion";

export const EASING = {
  // A custom cubic bezier that feels "organic" - distinct from standard springs
  living: [0.25, 0.4, 0.25, 0.9] as const,
  pulse: [0.4, 0.0, 0.2, 1] as const,
};

export const TRANSITIONS = {
  float: (duration: number = 6): Transition => ({
    duration,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "reverse",
  }),
  orbit: (duration: number = 20): Transition => ({
    duration,
    ease: "linear",
    repeat: Infinity,
  }),
};

export const VARIANTS = {
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  },
};
