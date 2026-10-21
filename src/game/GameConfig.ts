/**
 * AETHERFALL — central tuning values.
 *
 * Conventions (shared with the Blender pipeline, see docs/BLENDER_PIPELINE.md):
 *  - Units are meters, seconds and radians.
 *  - World is Y-up. The Phase 1 route runs from the start island toward -Z.
 *  - Characters face +Z in local space (Blender -Y forward, exported with +Y up).
 */

export const PLAYER_CONFIG = {
  /** Collision cylinder radius. */
  radius: 0.35,
  /** Collision cylinder height (feet to top of head). */
  height: 1.75,

  walkSpeed: 4.6,
  sprintSpeed: 8.2,
  groundAcceleration: 55,
  groundDeceleration: 70,
  airAcceleration: 16,

  /** Initial upward velocity. With gravity 26 this gives a ~1.6 m apex. */
  jumpVelocity: 9.2,
  gravity: 26,
  /** Extra gravity while falling, for a snappier arc. */
  fallGravityMultiplier: 1.35,
  /** Extra gravity while rising with Space released (variable jump height). */
  lowJumpGravityMultiplier: 2.1,
  maxFallSpeed: 38,

  /** Grace period after leaving a ledge during which a jump is still allowed. */
  coyoteTime: 0.1,
  /** A jump pressed this long before landing is still honoured. */
  jumpBufferTime: 0.12,

  /** Ledges up to this height are climbed automatically while grounded. */
  stepHeight: 0.4,
  /** Fraction of the radius that must overlap a surface to stand on it. */
  supportRadiusFactor: 0.85,
  turnSharpness: 14,

  /** Minimum impact speed that triggers the Land state. */
  hardLandingSpeed: 7,
  landStateDuration: 0.16,

  /** Simulation substep. Movement is integrated in steps no larger than this. */
  maxSubstep: 1 / 120,
  /** Large frame gaps (tab switch, GC pause) are clamped to this. */
  maxFrameDelta: 0.1,
} as const

export const CAMERA_CONFIG = {
  fov: 50,
  distance: 5.8,
  minDistance: 2.8,
  maxDistance: 10,
  zoomStep: 0.75,
  initialPitch: 0.28,
  minPitch: -0.35,
  maxPitch: 1.15,
  /** Radians per pixel of mouse drag. */
  sensitivity: 0.0042,
  /** Height above the feet the camera orbits around. */
  targetHeight: 1.35,
  followSharpness: 14,
  verticalSharpness: 7.5,
  /** How quickly the camera returns to full distance after an obstruction clears. */
  distanceRecoverySharpness: 4.5,
  collisionPadding: 0.28,
  /** Seconds to blend from the title shot into gameplay. */
  introBlendDuration: 1.8,
} as const

export const WORLD_CONFIG = {
  /** Falling below this height respawns the player at the last checkpoint. */
  killPlaneY: -24,
  fogNear: 45,
  fogFar: 340,
} as const

/** Shared colour palette: charcoal, slate blue, pale gold, lush moss, terracotta scarf, Aether cyan. */
export const PALETTE = {
  skyTop: '#3a5c7e',
  skyHorizon: '#e0cca5',
  skyBelow: '#1c2836',
  fog: '#6d89a4',
  sun: '#fff4de',
  sunWarm: '#f5cf86',
  rimLight: '#7ab8d6',
  hemiSky: '#8eb3d4',
  hemiGround: '#2d3a46',

  stoneTop: '#d5cbba',
  stoneTopMoss: '#a4b18d',
  stoneSide: '#5b6571',
  stoneDark: '#28313b',
  bridgeTop: '#c6bca6',
  ruin: '#6c7784',
  monumentStone: '#333d48',
  monumentGold: '#e2bf6d',
  rockTop: '#4e5b46',
  rockMid: '#323c46',
  rockBottom: '#181f26',
  moss: '#4f7538',
  grass: '#638e3c',
  flower: '#f2f6fa',
  foliage: '#2b3f2f',

  waterfall: '#8febff',
  waterfallFoam: '#eefaff',

  gold: '#c9a961',
  goldBright: '#ffd77a',
  aether: '#5ff0ff',
  aetherCore: '#8effff',
  aetherRune: '#3cd8ec',

  cloudLit: '#fff3dd',
  cloudShadow: '#849db5',
  cloudDeep: '#334456',

  cloth: '#1f2935',
  clothLight: '#2c3a4b',
  clothDark: '#141c24',
  scarf: '#a84828',
  scarfShadow: '#762c14',
  leather: '#4e3725',
  leatherDark: '#2d1e14',
  hair: '#1d1c20',
  skin: '#d4b396',
} as const

