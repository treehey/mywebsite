export const motionTokens = {
  camera: {
    duration: 1.4,
    scrub: 0.9,
  },
  settle: {
    duration: 0.72,
    ease: "power3.out",
  },
  spring: {
    type: "spring" as const,
    stiffness: 175,
    damping: 24,
    mass: 0.82,
  },
  snapSpring: {
    type: "spring" as const,
    stiffness: 260,
    damping: 25,
    mass: 0.62,
  },
} as const;
