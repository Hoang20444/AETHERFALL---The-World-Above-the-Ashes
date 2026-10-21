import { PLAYER_CONFIG as P } from '../GameConfig'
import type { PlayerSim } from './PlayerMovement'

/**
 * Character locomotion state model. Derived from the movement simulation every
 * frame; it never feeds back into movement. Visual layers (placeholder now,
 * Blender rig later) map these states to animation clips.
 */

export type PlayerStateName = 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'land'

export interface PlayerStateMachine {
  current: PlayerStateName
  previous: PlayerStateName
  /** Seconds spent in the current state. */
  timeInState: number
  landTimer: number
  /** Horizontal speed this frame, cached for visual layers. */
  horizontalSpeed: number
}

/**
 * Expected clip names in the Blender-exported character GLB.
 * Keep these names in sync with the NLA/Action names in Blender.
 */
export const ANIMATION_CLIPS: Record<PlayerStateName, string> = {
  idle: 'Idle',
  walk: 'Walk',
  run: 'Run',
  jump: 'Jump',
  fall: 'Fall',
  land: 'Land',
}

export function createStateMachine(): PlayerStateMachine {
  return { current: 'idle', previous: 'idle', timeInState: 0, landTimer: 0, horizontalSpeed: 0 }
}

export function resetStateMachine(machine: PlayerStateMachine) {
  machine.current = 'idle'
  machine.previous = 'idle'
  machine.timeInState = 0
  machine.landTimer = 0
  machine.horizontalSpeed = 0
}

export function updatePlayerState(machine: PlayerStateMachine, sim: PlayerSim, dt: number) {
  const speed = Math.hypot(sim.velocity.x, sim.velocity.z)
  machine.horizontalSpeed = speed
  machine.landTimer = Math.max(0, machine.landTimer - dt)

  let next: PlayerStateName
  if (sim.jumpedThisFrame) {
    next = 'jump'
  } else if (!sim.grounded) {
    next = sim.velocity.y > 0 && machine.current === 'jump' ? 'jump' : 'fall'
  } else if (sim.landedThisFrame && sim.landingSpeed >= P.hardLandingSpeed) {
    machine.landTimer = P.landStateDuration
    next = 'land'
  } else if (machine.current === 'land' && machine.landTimer > 0) {
    next = 'land'
  } else if (speed < 0.2) {
    next = 'idle'
  } else if (speed > P.walkSpeed + 0.6) {
    next = 'run'
  } else {
    next = 'walk'
  }

  if (next !== machine.current) {
    machine.previous = machine.current
    machine.current = next
    machine.timeInState = 0
  } else {
    machine.timeInState += dt
  }
}
