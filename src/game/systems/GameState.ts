import { useSyncExternalStore } from 'react'

/**
 * Minimal game-flow store. Holds only low-frequency state that the UI reacts to.
 * Per-frame data (player position, velocity) lives in mutable runtime objects
 * owned by the scene so React never re-renders at 60 Hz.
 */

export type GamePhase = 'intro' | 'playing' | 'paused' | 'complete'

export interface Toast {
  id: number
  text: string
}

export interface GameSnapshot {
  phase: GamePhase
  /** Incremented on restart; scene systems reset when it changes. */
  runId: number
  /** Highest checkpoint reached in the current run. */
  checkpointIndex: number
  completionTime: number | null
  /** Incremented every time the player falls and is respawned. */
  respawnId: number
  /** Incremented whenever the objective banner should be shown. */
  objectiveRevealId: number
  toast: Toast | null
}

let state: GameSnapshot = {
  phase: 'intro',
  runId: 0,
  checkpointIndex: 0,
  completionTime: null,
  respawnId: 0,
  objectiveRevealId: 0,
  toast: null,
}

const listeners = new Set<() => void>()
let toastCounter = 0

function setState(patch: Partial<GameSnapshot>) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

/** Play-time clock, advanced by the player controller only while playing. */
export const gameClock = { elapsed: 0 }

export const gameStore = {
  getState: () => state,

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  beginJourney() {
    if (state.phase !== 'intro') return
    gameClock.elapsed = 0
    setState({ phase: 'playing', objectiveRevealId: state.objectiveRevealId + 1 })
  },

  pause() {
    if (state.phase === 'playing') setState({ phase: 'paused' })
  },

  resume() {
    if (state.phase === 'paused') setState({ phase: 'playing' })
  },

  togglePause() {
    if (state.phase === 'playing') setState({ phase: 'paused' })
    else if (state.phase === 'paused') setState({ phase: 'playing' })
  },

  restart() {
    gameClock.elapsed = 0
    setState({
      phase: 'playing',
      runId: state.runId + 1,
      checkpointIndex: 0,
      completionTime: null,
      toast: null,
      objectiveRevealId: state.objectiveRevealId + 1,
    })
  },

  reachCheckpoint(index: number, message: string) {
    if (index <= state.checkpointIndex) return
    toastCounter += 1
    setState({ checkpointIndex: index, toast: { id: toastCounter, text: message } })
  },

  registerRespawn() {
    setState({ respawnId: state.respawnId + 1 })
  },

  complete() {
    if (state.phase !== 'playing') return
    setState({ phase: 'complete', completionTime: gameClock.elapsed })
  },
}

/** Subscribe a component to one slice of game state. Selectors must return stable values. */
export function useGameSelector<T>(selector: (snapshot: GameSnapshot) => T): T {
  return useSyncExternalStore(gameStore.subscribe, () => selector(gameStore.getState()))
}
