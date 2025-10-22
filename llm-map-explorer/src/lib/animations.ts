/**
 * Animation Configuration
 *
 * Centralized animation tokens and timing configurations for consistent,
 * accessible animations throughout the application.
 *
 * @example
 * import { ANIMATION_DURATIONS, ANIMATION_EASING } from '@/lib/animations';
 * const style = { animation: `slideIn ${ANIMATION_DURATIONS.normal}ms ${ANIMATION_EASING.easeOut}` };
 */

/**
 * Standard animation durations in milliseconds
 * Use these for consistent timing across all animations
 */
export const ANIMATION_DURATIONS = {
  /** Fast animations for subtle transitions (e.g., button hover) */
  fast: 150,
  /** Normal animations for standard transitions (e.g., panel slide-in) */
  normal: 300,
  /** Slow animations for emphasis (e.g., tour transitions) */
  slow: 500,
  /** Slowest animations for important state changes */
  slowest: 700,
} as const;

/**
 * Standard easing functions following CSS conventions
 * easeOut: For entrances (things appearing)
 * easeIn: For exits (things disappearing)
 * easeInOut: For continuous transitions
 */
export const ANIMATION_EASING = {
  /** Standard ease-in: accelerating from zero velocity */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Standard ease-out: decelerating to zero velocity */
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Standard ease-in-out: acceleration until halfway, then deceleration */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Smooth ease-in (quadratic) */
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  /** Smooth ease-out (quadratic) */
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

/**
 * Pre-configured animation combinations
 * Use these in components for consistent animation behavior
 */
export const animationConfig = {
  /** Panel slide-in from right: 300ms ease-out */
  panelSlideIn: `${ANIMATION_DURATIONS.normal}ms ${ANIMATION_EASING.easeOut}`,
  /** Panel slide-out to right: 200ms ease-in */
  panelSlideOut: `${ANIMATION_DURATIONS.fast}ms ${ANIMATION_EASING.easeIn}`,
  /** Content fade-in: 300ms ease-out */
  fadeIn: `${ANIMATION_DURATIONS.normal}ms ${ANIMATION_EASING.easeOut}`,
  /** Content fade-out: 200ms ease-in */
  fadeOut: `${ANIMATION_DURATIONS.fast}ms ${ANIMATION_EASING.easeIn}`,
  /** Component scale-in: 300ms ease-out */
  scaleIn: `${ANIMATION_DURATIONS.normal}ms ${ANIMATION_EASING.easeOut}`,
  /** Map transition (pan/zoom): 1000ms ease-out */
  mapTransition: `${1000}ms ${ANIMATION_EASING.easeOut}`,
  /** Quick hover effect: 200ms ease-out */
  hoverEffect: `${200}ms ${ANIMATION_EASING.easeOut}`,
} as const;

/**
 * Media query for respecting user's motion preferences
 * Use in CSS to disable animations for users with prefers-reduced-motion
 *
 * @example
 * const prefersReducedMotion = '(prefers-reduced-motion: reduce)';
 * // Then in media query:
 * '@media (prefers-reduced-motion: reduce) { animation: none; }'
 */
export const PREFERS_REDUCED_MOTION = '(prefers-reduced-motion: reduce)' as const;

/**
 * Helper to get animation string with fallback for reduced motion
 *
 * @param animation - Animation name and duration
 * @param shouldDisable - Whether to disable animation
 * @returns Animation string or 'none'
 *
 * @example
 * const animation = getAnimation('slideIn 300ms ease-out', prefersReducedMotion);
 */
export const getAnimation = (animation: string, shouldDisable: boolean): string => {
  return shouldDisable ? 'none' : animation;
};

// Type exports for TypeScript users
export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
export type AnimationEasing = keyof typeof ANIMATION_EASING;
export type AnimationConfig = keyof typeof animationConfig;
