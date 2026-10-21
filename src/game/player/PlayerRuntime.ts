import { CAMERA_CONFIG } from '../GameConfig'
import type { PlayerSim } from './PlayerMovement'
import { createPlayerSim } from './PlayerMovement'
import type { PlayerStateMachine } from './PlayerState'
import { createStateMachine } from './PlayerState'

/**
 * Mutable per-frame data shared between the player controller, camera and
 * lighting. Created once per scene; never stored in React state.
 */
export interface PlayerRuntime {
  sim: PlayerSim
  state: PlayerStateMachine
  /** Incremented on every teleport (spawn, respawn, restart) so followers can snap. */
  teleportId: number
}

export interface CameraRig {
  /** 0 = camera behind the player looking toward -Z. */
  yaw: number
  pitch: number
  distance: number
}

export function createPlayerRuntime(): PlayerRuntime {
  return { sim: createPlayerSim(), state: createStateMachine(), teleportId: 0 }
}

export function createCameraRig(): CameraRig {
  return { yaw: 0, pitch: CAMERA_CONFIG.initialPitch, distance: CAMERA_CONFIG.distance }
}
