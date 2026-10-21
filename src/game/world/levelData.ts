import type { Collider } from '../systems/Collision'
import { boxCollider, cylinderCollider } from '../systems/Collision'

/**
 * Phase 1 level layout: "The Shattered Approach".
 *
 * This file is the single source of truth for walkable geometry. Both the
 * rendered platforms and the collision prisms are generated from it, so the
 * visuals can never drift away from what the player actually stands on.
 *
 * Route (toward -Z): start island -> stepping stones -> bridge head ->
 * broken bridge (sprint jump) -> ruined courtyard (checkpoint) ->
 * ascending pillars (vertical challenge) -> monument plateau (goal).
 *
 * Jump reference: apex ~1.6 m, walking jump ~3.0 m, sprinting jump ~5.4 m.
 */

export type PieceStyle = 'island' | 'stone' | 'bridge' | 'column' | 'ruin' | 'curb'

interface PieceBase {
  id: string
  style: PieceStyle
  x: number
  z: number
  /** Y of the walkable top surface. */
  top: number
  thickness: number
  /** Depth of the decorative rock mass hanging below the piece (0 = none). */
  rock?: number
}

export interface BoxPiece extends PieceBase {
  shape: 'box'
  width: number
  depth: number
  yaw?: number
}

export interface CylinderPiece extends PieceBase {
  shape: 'cylinder'
  radius: number
}

export type LevelPiece = BoxPiece | CylinderPiece

const box = (p: Omit<BoxPiece, 'shape'>): BoxPiece => ({ shape: 'box', ...p })
const cyl = (p: Omit<CylinderPiece, 'shape'>): CylinderPiece => ({ shape: 'cylinder', ...p })

/** Low stone curbs running along both edges of a bridge deck. */
function curbsFor(bridge: BoxPiece): BoxPiece[] {
  const curbWidth = 0.24
  const offset = bridge.width / 2 - curbWidth / 2
  return [-1, 1].map((side) =>
    box({
      id: `${bridge.id}-curb-${side}`,
      style: 'curb',
      x: bridge.x + side * offset,
      z: bridge.z,
      top: bridge.top + 0.22,
      thickness: 0.22,
      width: curbWidth,
      depth: bridge.depth,
    }),
  )
}

const bridgeA = box({ id: 'bridge-a', style: 'bridge', x: 2, z: -27.7, top: 1.2, thickness: 0.7, width: 2.8, depth: 7 })
const bridgeB = box({ id: 'bridge-b', style: 'bridge', x: 2, z: -37.35, top: 0.9, thickness: 0.7, width: 2.8, depth: 5.5 })

export const PLATEAU_Y = 7

export const LEVEL_PIECES: LevelPiece[] = [
  // --- Start island ---
  cyl({ id: 'start', style: 'island', x: 0, z: 0, top: 0, thickness: 1.4, radius: 7, rock: 13 }),
  // Broken arch framing the first view of the monument.
  cyl({ id: 'arch-left', style: 'ruin', x: -1.3, z: -5.4, top: 4.2, thickness: 4.2, radius: 0.42 }),
  cyl({ id: 'arch-right', style: 'ruin', x: 3.1, z: -5.6, top: 2.5, thickness: 2.5, radius: 0.42 }),
  box({ id: 'arch-lintel', style: 'ruin', x: -0.35, z: -5.45, top: 4.75, thickness: 0.55, width: 2.7, depth: 0.75 }),
  // Weathered wall fragments behind the spawn.
  box({ id: 'wall-a', style: 'ruin', x: -3.7, z: 4.5, top: 1.3, thickness: 1.3, width: 3.2, depth: 0.7, yaw: 0.55 }),
  box({ id: 'wall-b', style: 'ruin', x: 3.5, z: 4.9, top: 0.8, thickness: 0.8, width: 2.2, depth: 0.7, yaw: -0.5 }),

  // --- Stepping stones (each gap ~1-1.5 m, rising 0.6 m) ---
  cyl({ id: 'stone-1', style: 'stone', x: 1.2, z: -10, top: 0, thickness: 0.8, radius: 1.6, rock: 2.6 }),
  cyl({ id: 'stone-2', style: 'stone', x: 3.4, z: -13.6, top: 0.6, thickness: 0.8, radius: 1.4, rock: 2.2 }),
  cyl({ id: 'stone-3', style: 'stone', x: 2.2, z: -17.3, top: 1.2, thickness: 0.8, radius: 1.5, rock: 2.4 }),

  // --- Broken bridge (3.4 m gap: needs a sprint jump) ---
  box({ id: 'bridge-head', style: 'stone', x: 2, z: -21.7, top: 1.2, thickness: 1.4, width: 5.5, depth: 5, rock: 5 }),
  bridgeA,
  ...curbsFor(bridgeA),
  bridgeB,
  ...curbsFor(bridgeB),

  // --- Ruined courtyard (checkpoint) ---
  box({ id: 'courtyard', style: 'island', x: 2.5, z: -44, top: 0.9, thickness: 1.6, width: 8, depth: 8, rock: 7 }),
  cyl({ id: 'court-column-a', style: 'ruin', x: -0.6, z: -46.9, top: 3.5, thickness: 2.6, radius: 0.45 }),
  cyl({ id: 'court-column-b', style: 'ruin', x: 5.4, z: -41.0, top: 2.3, thickness: 1.4, radius: 0.45 }),
  box({ id: 'court-fallen', style: 'ruin', x: 0.2, z: -44.6, top: 1.7, thickness: 0.8, width: 2.8, depth: 0.8, yaw: 0.5 }),

  // --- Ascending pillars (vertical challenge, +1.1..1.3 m per step) ---
  box({ id: 'climb-1', style: 'column', x: 7.2, z: -46.5, top: 2.2, thickness: 8.2, width: 2.4, depth: 2.4 }),
  box({ id: 'climb-2', style: 'column', x: 8.6, z: -49.6, top: 3.5, thickness: 9.5, width: 2.2, depth: 2.2 }),
  box({ id: 'climb-3', style: 'column', x: 6.4, z: -52.4, top: 4.8, thickness: 10.8, width: 2.2, depth: 2.2 }),
  box({ id: 'climb-4', style: 'column', x: 3.6, z: -54.6, top: 5.9, thickness: 11.9, width: 2.2, depth: 2.2 }),

  // --- Monument plateau ---
  cyl({ id: 'plateau', style: 'island', x: 3, z: -64, top: PLATEAU_Y, thickness: 2.2, radius: 8.5, rock: 15 }),
  cyl({ id: 'plateau-column-a', style: 'ruin', x: -2.4, z: -62.5, top: PLATEAU_Y + 3.4, thickness: 3.4, radius: 0.5 }),
  cyl({ id: 'plateau-column-b', style: 'ruin', x: 8.6, z: -62.0, top: PLATEAU_Y + 1.6, thickness: 1.6, radius: 0.5 }),
  cyl({ id: 'plateau-column-c', style: 'ruin', x: -1.0, z: -69.8, top: PLATEAU_Y + 4.2, thickness: 4.2, radius: 0.5 }),
  cyl({ id: 'plateau-column-d', style: 'ruin', x: 7.6, z: -70.2, top: PLATEAU_Y + 1.0, thickness: 1.0, radius: 0.5 }),
]

/** The Ancient Monument: stepped base, obelisk and floating Aether core. */
export const MONUMENT = {
  x: 3,
  z: -66.5,
  baseY: PLATEAU_Y,
  tiers: [
    { size: 6, height: 0.35 },
    { size: 4.6, height: 0.35 },
    { size: 3.2, height: 0.35 },
  ],
  obeliskHeight: 7.5,
  obeliskBottomHalf: 0.62,
  obeliskTopHalf: 0.4,
  /** Horizontal distance from the monument centre that completes the level. */
  triggerRadius: 3.6,
} as const

export interface Checkpoint {
  id: string
  /** Spawn position (feet). */
  x: number
  y: number
  z: number
  /** Camera yaw on spawn (0 = looking toward -Z). */
  yaw: number
  /** Activation radius (horizontal). 0 for the initial spawn. */
  radius: number
  message: string
}

export const CHECKPOINTS: Checkpoint[] = [
  { id: 'start', x: 0, y: 0, z: 2.5, yaw: 0, radius: 0, message: '' },
  { id: 'courtyard', x: 2.2, y: 0.9, z: -42.2, yaw: 0, radius: 3.6, message: 'Waystone attuned. Progress saved.' },
]

/** Glowing waystones mark checkpoints in the world. */
export const WAYSTONES = [
  { checkpoint: 0, x: -2.6, y: 0, z: 0.6 },
  { checkpoint: 1, x: -0.4, y: 0.9, z: -41.3 },
] as const

function buildColliders(): Collider[] {
  const colliders: Collider[] = LEVEL_PIECES.map((p) => {
    const bottom = p.top - p.thickness
    return p.shape === 'box'
      ? boxCollider(p.x, p.z, p.width, p.depth, bottom, p.top, p.yaw ?? 0)
      : cylinderCollider(p.x, p.z, p.radius, bottom, p.top)
  })

  // Monument tiers are walkable steps (0.35 m, below the auto-step height).
  let y = MONUMENT.baseY
  for (const tier of MONUMENT.tiers) {
    colliders.push(boxCollider(MONUMENT.x, MONUMENT.z, tier.size, tier.size, y, y + tier.height))
    y += tier.height
  }
  const obeliskWidth = MONUMENT.obeliskBottomHalf * 2
  colliders.push(boxCollider(MONUMENT.x, MONUMENT.z, obeliskWidth, obeliskWidth, y, y + MONUMENT.obeliskHeight))

  for (const w of WAYSTONES) colliders.push(cylinderCollider(w.x, w.z, 0.38, w.y, w.y + 1.35))

  return colliders
}

export const LEVEL_COLLIDERS: readonly Collider[] = buildColliders()
