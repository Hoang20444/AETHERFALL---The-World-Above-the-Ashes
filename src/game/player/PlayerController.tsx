import { useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { CAMERA_CONFIG, WORLD_CONFIG } from '../GameConfig'
import { getSpawnPoint, updateProgress } from '../systems/CheckpointSystem'
import { gameClock, gameStore, useGameSelector } from '../systems/GameState'
import { createMoveInput, keyboard, resetMoveInput } from '../systems/Input'
import { LEVEL_COLLIDERS } from '../world/levelData'
import { PlayerAvatar } from './PlayerAvatar.tsx'
import { placePlayer, updatePlayer } from './PlayerMovement'
import type { CameraRig, PlayerRuntime } from './PlayerRuntime'
import { resetStateMachine, updatePlayerState } from './PlayerState'

/** Frame priority: the controller runs before the camera (-1) and everything else (0). */
export const PLAYER_FRAME_PRIORITY = -2

interface PlayerControllerProps {
  runtime: PlayerRuntime
  rig: CameraRig
}

/**
 * Glue between input, simulation, progress tracking and the visual avatar.
 * Swap <PlayerAvatar> for a Blender character without touching this logic.
 */
export function PlayerController({ runtime, rig }: PlayerControllerProps) {
  const root = useRef<Group>(null)
  const input = useRef(createMoveInput()).current
  const runId = useGameSelector((s) => s.runId)

  const respawn = useCallback(
    (checkpointIndex: number) => {
      const cp = getSpawnPoint(checkpointIndex)
      placePlayer(runtime.sim, cp.x, cp.y + 0.02, cp.z, cp.yaw + Math.PI)
      resetStateMachine(runtime.state)
      rig.yaw = cp.yaw
      rig.pitch = CAMERA_CONFIG.initialPitch
      runtime.teleportId += 1
    },
    [runtime, rig],
  )

  // Initial spawn and every restart.
  useEffect(() => {
    respawn(0)
  }, [runId, respawn])

  useFrame((_, rawDelta) => {
    const { phase, checkpointIndex } = gameStore.getState()
    const sim = runtime.sim

    if (phase === 'intro' || phase === 'paused') {
      keyboard.discardQueued()
    } else {
      const dt = Math.min(rawDelta, 0.1)
      if (phase === 'playing') {
        keyboard.read(input)
        gameClock.elapsed += dt
      } else {
        resetMoveInput(input) // completed: let the character settle without control
      }

      updatePlayer(sim, input, rig.yaw, LEVEL_COLLIDERS, dt)
      updatePlayerState(runtime.state, sim, dt)

      if (sim.position.y < WORLD_CONFIG.killPlaneY) {
        respawn(checkpointIndex)
        gameStore.registerRespawn()
      } else if (phase === 'playing') {
        updateProgress(sim.position)
      }
    }

    const group = root.current
    if (group) {
      group.position.copy(sim.position)
      group.rotation.y = sim.facingYaw
    }
  }, PLAYER_FRAME_PRIORITY)

  return (
    <group ref={root}>
      <PlayerAvatar state={runtime.state} />
    </group>
  )
}
