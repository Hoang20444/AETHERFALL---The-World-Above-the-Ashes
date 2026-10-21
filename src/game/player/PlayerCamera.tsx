import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { CAMERA_CONFIG as C } from '../GameConfig'
import { raycastColliders } from '../systems/Collision'
import { gameStore } from '../systems/GameState'
import { LEVEL_COLLIDERS } from '../world/levelData'
import type { CameraRig, PlayerRuntime } from './PlayerRuntime'

/** Runs after the player controller (-2) so the camera never lags a frame. */
const CAMERA_FRAME_PRIORITY = -1

/** Slow establishing shot used behind the title screen. */
const INTRO_SHOT = {
  from: new Vector3(-17, 8.5, 15),
  to: new Vector3(-9, 6.5, 11),
  lookAt: new Vector3(3, 6, -42),
  speed: 0.09,
}

const damp = (sharpness: number, dt: number) => 1 - Math.exp(-sharpness * dt)
const smoothstep = (t: number) => t * t * (3 - 2 * t)

interface PlayerCameraProps {
  runtime: PlayerRuntime
  rig: CameraRig
}

/**
 * Third-person orbit camera with collision pull-in, plus the intro shot and
 * its blend into gameplay. Orbit: hold left or right mouse button and drag.
 */
export function PlayerCamera({ runtime, rig }: PlayerCameraProps) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  const scratch = useRef({
    focus: new Vector3(),
    offset: new Vector3(),
    followPosition: new Vector3(),
    introPosition: new Vector3(),
    look: new Vector3(),
    currentDistance: C.distance as number,
    lastTeleportId: -1,
    introTime: 0,
    blend: 0,
  }).current


  // Mouse orbit and zoom.
  useEffect(() => {
    const element = gl.domElement
    let dragging = false

    const onPointerDown = (event: PointerEvent) => {
      if (gameStore.getState().phase !== 'playing') return
      if (event.button !== 0 && event.button !== 2) return
      dragging = true
      element.setPointerCapture(event.pointerId)
      element.style.cursor = 'grabbing'
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      rig.yaw -= event.movementX * C.sensitivity
      rig.pitch = Math.min(C.maxPitch, Math.max(C.minPitch, rig.pitch + event.movementY * C.sensitivity))
    }
    const endDrag = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
      element.style.cursor = ''
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (gameStore.getState().phase !== 'playing') return
      rig.distance = Math.min(C.maxDistance, Math.max(C.minDistance, rig.distance + Math.sign(event.deltaY) * C.zoomStep))
    }
    const onContextMenu = (event: MouseEvent) => event.preventDefault()

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', endDrag)
    element.addEventListener('pointercancel', endDrag)
    element.addEventListener('lostpointercapture', endDrag)
    element.addEventListener('wheel', onWheel, { passive: false })
    element.addEventListener('contextmenu', onContextMenu)
    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', endDrag)
      element.removeEventListener('pointercancel', endDrag)
      element.removeEventListener('lostpointercapture', endDrag)
      element.removeEventListener('wheel', onWheel)
      element.removeEventListener('contextmenu', onContextMenu)
      element.style.cursor = ''
    }
  }, [gl, rig])

  useFrame((_, rawDelta) => {
    const phase = gameStore.getState().phase
    const dt = Math.min(rawDelta, 0.1)
    const s = scratch
    const player = runtime.sim.position

    if (phase === 'paused') return

    // Establishing shot.
    if (phase === 'intro') {
      s.introTime += dt
      const t = 0.5 - 0.5 * Math.cos(s.introTime * INTRO_SHOT.speed)
      s.introPosition.lerpVectors(INTRO_SHOT.from, INTRO_SHOT.to, t)
      camera.position.copy(s.introPosition)
      camera.lookAt(INTRO_SHOT.lookAt)
      s.blend = 0
      return
    }

    // Snap after spawns and respawns; otherwise follow smoothly.
    if (s.lastTeleportId !== runtime.teleportId) {
      s.lastTeleportId = runtime.teleportId
      s.focus.set(player.x, player.y + C.targetHeight, player.z)
      s.currentDistance = rig.distance
    } else {
      const horizontal = damp(C.followSharpness, dt)
      s.focus.x += (player.x - s.focus.x) * horizontal
      s.focus.z += (player.z - s.focus.z) * horizontal
      s.focus.y += (player.y + C.targetHeight - s.focus.y) * damp(C.verticalSharpness, dt)
    }

    const cosPitch = Math.cos(rig.pitch)
    s.offset.set(Math.sin(rig.yaw) * cosPitch, Math.sin(rig.pitch), Math.cos(rig.yaw) * cosPitch)

    // Pull in when geometry blocks the view; ease back out when it clears.
    const hit = raycastColliders(
      LEVEL_COLLIDERS,
      s.focus.x, s.focus.y, s.focus.z,
      s.offset.x, s.offset.y, s.offset.z,
      rig.distance + C.collisionPadding,
    )
    const allowed = Math.max(0.8, Math.min(rig.distance, hit - C.collisionPadding))
    if (allowed < s.currentDistance) s.currentDistance = allowed
    else s.currentDistance += (allowed - s.currentDistance) * damp(C.distanceRecoverySharpness, dt)

    // Camera focus with subtle over-the-shoulder offset
    const rightX = Math.cos(rig.yaw)
    const rightZ = -Math.sin(rig.yaw)
    const shoulderOffset = 0.22

    s.followPosition.copy(s.focus).addScaledVector(s.offset, s.currentDistance)
    s.followPosition.x += rightX * shoulderOffset
    s.followPosition.z += rightZ * shoulderOffset

    s.look.copy(s.focus)
    s.look.x += rightX * (shoulderOffset * 0.4)
    s.look.z += rightZ * (shoulderOffset * 0.4)

    if (s.blend < 1) {
      s.blend = Math.min(1, s.blend + dt / C.introBlendDuration)
      const e = smoothstep(s.blend)
      camera.position.lerpVectors(s.introPosition, s.followPosition, e)
      camera.lookAt(s.look)
    } else {
      camera.position.copy(s.followPosition)
      camera.lookAt(s.look)
    }
  }, CAMERA_FRAME_PRIORITY)

  return null
}
