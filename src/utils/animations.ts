// src/utils/animations.ts
import { Variants, TargetAndTransition, Transition } from 'framer-motion';

// Common animation variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const slideInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const slideInDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Hover animations
export const hoverScaleAnimation: TargetAndTransition = {
  scale: 1.02,
  y: -2,
};

export const tapAnimation: TargetAndTransition = {
  scale: 0.98,
  y: 0,
};

// Stagger transition
export const staggerTransition: Transition = {
  staggerChildren: 0.08,
  delayChildren: 0.1,
};

// Spring transition
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// Smooth transition
export const smoothTransition: Transition = {
  duration: 0.6,
  ease: 'easeInOut',
};

// Page transition variants
export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Floating animation
export const floatingVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Pulse animation
export const pulseVariants: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// Glow animation
export const glowVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 0px rgba(212, 175, 55, 0)',
      '0 0 20px rgba(212, 175, 55, 0.5)',
      '0 0 0px rgba(212, 175, 55, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// Shimmer animation
export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% center', '-200% center'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Rotate animation
export const rotateVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Bounce animation
export const bounceVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Exit animation helper
export const createExitAnimation = (direction: 'up' | 'down' | 'left' | 'right') => {
  const directions = {
    up: { y: -20, opacity: 0 },
    down: { y: 20, opacity: 0 },
    left: { x: -20, opacity: 0 },
    right: { x: 20, opacity: 0 },
  };
  return {
    ...directions[direction],
    transition: { duration: 0.3 },
  };
};
