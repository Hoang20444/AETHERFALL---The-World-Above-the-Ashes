import { CHECKPOINTS, MONUMENT } from '../world/levelData'
import { gameStore } from './GameState'
import type { Vector3 } from 'three'

/** Checkpoint activation, respawn points and the level goal trigger. */

export function getSpawnPoint(index: number) {
  return CHECKPOINTS[Math.min(Math.max(index, 0), CHECKPOINTS.length - 1)]
}

/** Call once per frame while playing. */
export function updateProgress(position: Vector3) {
  const { phase, checkpointIndex } = gameStore.getState()
  if (phase !== 'playing') return

  for (let i = checkpointIndex + 1; i < CHECKPOINTS.length; i++) {
    const cp = CHECKPOINTS[i]
    const dx = position.x - cp.x
    const dz = position.z - cp.z
    if (dx * dx + dz * dz <= cp.radius * cp.radius && Math.abs(position.y - cp.y) < 2.5) {
      gameStore.reachCheckpoint(i, cp.message)
    }
  }

  const gx = position.x - MONUMENT.x
  const gz = position.z - MONUMENT.z
  if (gx * gx + gz * gz <= MONUMENT.triggerRadius ** 2 && position.y > MONUMENT.baseY - 0.5) {
    gameStore.complete()
  }
}
