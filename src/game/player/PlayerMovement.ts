import { Vector3 } from 'three'
import { PLAYER_CONFIG as P } from '../GameConfig'
import type { Collider } from '../systems/Collision'
import { circleFootprintPush, footprintOverlaps, pushResult } from '../systems/Collision'
import type { MoveInput } from '../systems/Input'

/**
 * Kinematic third-person character movement.
 *
 * Pure simulation: no React, no rendering. Visual models (placeholder or a
 * Blender character) read from {@link PlayerSim} and never drive movement.
 * Future abilities (e.g. Aether Dash) should be added as additional velocity
 * sources inside {@link updatePlayer}, not inside visual components.
 */

export interface PlayerSim {
  /** Feet position. */
  position: Vector3
  velocity: Vector3
  grounded: boolean
  facingYaw: number
  coyoteTimer: number
  jumpBufferTimer: number
  hasMoveInput: boolean
  sprinting: boolean
  // Per-frame events, reset at the start of every update.
  jumpedThisFrame: boolean
  landedThisFrame: boolean
  landingSpeed: number
}

export function createPlayerSim(): PlayerSim {
  return {
    position: new Vector3(),
    velocity: new Vector3(),
    grounded: false,
    facingYaw: Math.PI,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    hasMoveInput: false,
    sprinting: false,
    jumpedThisFrame: false,
    landedThisFrame: false,
    landingSpeed: 0,
  }
}

export function placePlayer(sim: PlayerSim, x: number, y: number, z: number, facingYaw: number) {
  sim.position.set(x, y, z)
  sim.velocity.set(0, 0, 0)
  sim.grounded = false
  sim.facingYaw = facingYaw
  sim.coyoteTimer = 0
  sim.jumpBufferTimer = 0
  sim.hasMoveInput = false
  sim.sprinting = false
  sim.jumpedThisFrame = false
  sim.landedThisFrame = false
  sim.landingSpeed = 0
}

const CONTACT_EPSILON = 0.02
const LAND_TOLERANCE = 0.06

/**
 * Advances the player by one rendered frame. The frame is split into fixed-size
 * substeps so behaviour is identical at 30, 60 or 144 FPS.
 */
export function updatePlayer(
  sim: PlayerSim,
  input: MoveInput,
  cameraYaw: number,
  colliders: readonly Collider[],
  frameDelta: number,
) {
  sim.jumpedThisFrame = false
  sim.landedThisFrame = false
  if (input.jumpPressed) sim.jumpBufferTimer = P.jumpBufferTime

  let ix = input.strafe
  let iz = input.forward
  const inputLength = Math.hypot(ix, iz)
  if (inputLength > 1) {
    ix /= inputLength
    iz /= inputLength
  }

  // Camera-relative basis on the horizontal plane:
  // forward = (-sin yaw, -cos yaw), right = (cos yaw, -sin yaw)
  const sinYaw = Math.sin(cameraYaw)
  const cosYaw = Math.cos(cameraYaw)
  const wishX = cosYaw * ix - sinYaw * iz
  const wishZ = -sinYaw * ix - cosYaw * iz

  sim.hasMoveInput = inputLength > 0.01
  sim.sprinting = input.sprint && sim.hasMoveInput
  const speed = sim.sprinting ? P.sprintSpeed : P.walkSpeed
  const targetX = wishX * speed
  const targetZ = wishZ * speed

  let remaining = Math.min(frameDelta, P.maxFrameDelta)
  while (remaining > 1e-6) {
    const dt = Math.min(remaining, P.maxSubstep)
    substep(sim, input, targetX, targetZ, colliders, dt)
    remaining -= dt
  }

  if (sim.hasMoveInput) {
    sim.facingYaw = dampAngle(sim.facingYaw, Math.atan2(wishX, wishZ), P.turnSharpness, frameDelta)
  }
}

function substep(
  sim: PlayerSim,
  input: MoveInput,
  wantX: number,
  wantZ: number,
  colliders: readonly Collider[],
  dt: number,
) {
  const v = sim.velocity
  const p = sim.position

  // Horizontal acceleration. In the air, keep existing momentum if it exceeds
  // the requested speed so releasing Shift mid-jump does not stall the player.
  let targetX = wantX
  let targetZ = wantZ
  if (!sim.grounded) {
    const current = Math.hypot(v.x, v.z)
    const wanted = Math.hypot(wantX, wantZ)
    if (wanted > 1e-3 && current > wanted) {
      const scale = current / wanted
      targetX *= scale
      targetZ *= scale
    }
  }
  const accel = sim.grounded
    ? sim.hasMoveInput ? P.groundAcceleration : P.groundDeceleration
    : P.airAcceleration
  const dvx = targetX - v.x
  const dvz = targetZ - v.z
  const dvLength = Math.hypot(dvx, dvz)
  const maxChange = accel * dt
  if (dvLength <= maxChange) {
    v.x = targetX
    v.z = targetZ
  } else {
    v.x += (dvx / dvLength) * maxChange
    v.z += (dvz / dvLength) * maxChange
  }

  // Jumping: buffered input + coyote time. Only one jump per ground contact.
  sim.coyoteTimer = sim.grounded ? P.coyoteTime : Math.max(0, sim.coyoteTimer - dt)
  sim.jumpBufferTimer = Math.max(0, sim.jumpBufferTimer - dt)
  if (sim.jumpBufferTimer > 0 && sim.coyoteTimer > 0) {
    v.y = P.jumpVelocity
    sim.grounded = false
    sim.coyoteTimer = 0
    sim.jumpBufferTimer = 0
    sim.jumpedThisFrame = true
  }

  // Gravity (heavier when falling, and when Space is released early).
  let gravity = P.gravity
  if (v.y < 0) gravity *= P.fallGravityMultiplier
  else if (v.y > 0 && !input.jumpHeld) gravity *= P.lowJumpGravityMultiplier
  v.y = Math.max(v.y - gravity * dt, -P.maxFallSpeed)

  p.x += v.x * dt
  p.z += v.z * dt
  resolveHorizontal(sim, colliders)

  const previousY = p.y
  p.y += v.y * dt
  resolveVertical(sim, colliders, previousY)
}

function resolveHorizontal(sim: PlayerSim, colliders: readonly Collider[]) {
  const p = sim.position
  const v = sim.velocity
  for (let pass = 0; pass < 2; pass++) {
    let pushed = false
    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i]
      if (p.y >= c.top - CONTACT_EPSILON) continue // standing on or above it
      if (p.y + P.height <= c.bottom) continue // passing underneath
      if (!circleFootprintPush(c, p.x, p.z, P.radius)) continue

      // Small ledges (stairs, curbs) are stepped onto instead of blocking.
      if (sim.grounded && c.top - p.y <= P.stepHeight) {
        p.y = c.top
        continue
      }

      p.x += pushResult.x
      p.z += pushResult.z
      const length = Math.hypot(pushResult.x, pushResult.z)
      if (length > 1e-6) {
        const nx = pushResult.x / length
        const nz = pushResult.z / length
        const into = v.x * nx + v.z * nz
        if (into < 0) {
          v.x -= into * nx
          v.z -= into * nz
        }
      }
      pushed = true
    }
    if (!pushed) break
  }
}

function resolveVertical(sim: PlayerSim, colliders: readonly Collider[], previousY: number) {
  const p = sim.position
  const v = sim.velocity

  if (v.y <= 0) {
    const supportRadius = P.radius * P.supportRadiusFactor
    let support = -Infinity
    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i]
      if (c.top > previousY + LAND_TOLERANCE || c.top < p.y) continue
      if (c.top <= support) continue
      if (footprintOverlaps(c, p.x, p.z, supportRadius)) support = c.top
    }
    if (support > -Infinity) {
      if (!sim.grounded) {
        sim.landedThisFrame = true
        sim.landingSpeed = -v.y
      }
      p.y = support
      v.y = 0
      sim.grounded = true
    } else {
      sim.grounded = false
    }
    return
  }

  // Rising: stop at ceilings.
  sim.grounded = false
  const head = p.y + P.height
  const previousHead = previousY + P.height
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i]
    if (previousHead <= c.bottom + LAND_TOLERANCE && head > c.bottom && footprintOverlaps(c, p.x, p.z, P.radius * 0.9)) {
      p.y = c.bottom - P.height
      v.y = 0
      break
    }
  }
}

/** Frame-rate independent exponential smoothing toward an angle along the shortest arc. */
export function dampAngle(current: number, target: number, sharpness: number, dt: number): number {
  let delta = (target - current) % (Math.PI * 2)
  if (delta > Math.PI) delta -= Math.PI * 2
  if (delta < -Math.PI) delta += Math.PI * 2
  return current + delta * (1 - Math.exp(-sharpness * dt))
}
