/**
 * Lightweight static collision for a kinematic character.
 *
 * World geometry is approximated by vertical prisms:
 *  - boxes (optionally rotated around Y)
 *  - vertical cylinders
 * The player is a vertical cylinder. This is enough for reliable platforming
 * and is trivially extendable (moving platforms, dash sweeps) in later phases.
 * Limitations: no slopes and no arbitrary mesh collision.
 */

export interface BoxCollider {
  kind: 'box'
  cx: number
  cz: number
  hx: number
  hz: number
  cos: number
  sin: number
  bottom: number
  top: number
}

export interface CylinderCollider {
  kind: 'cylinder'
  cx: number
  cz: number
  radius: number
  bottom: number
  top: number
}

export type Collider = BoxCollider | CylinderCollider

export function boxCollider(
  cx: number, cz: number, width: number, depth: number, bottom: number, top: number, yaw = 0,
): BoxCollider {
  return { kind: 'box', cx, cz, hx: width / 2, hz: depth / 2, cos: Math.cos(yaw), sin: Math.sin(yaw), bottom, top }
}

export function cylinderCollider(cx: number, cz: number, radius: number, bottom: number, top: number): CylinderCollider {
  return { kind: 'cylinder', cx, cz, radius, bottom, top }
}

// Scratch values reused to avoid allocations in the simulation loop.
let localX = 0
let localZ = 0

/** World -> box-local transform (inverse of a three.js rotation.y = yaw). */
function toLocal(c: BoxCollider, x: number, z: number) {
  const dx = x - c.cx
  const dz = z - c.cz
  localX = dx * c.cos - dz * c.sin
  localZ = dx * c.sin + dz * c.cos
}

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v)

/** True if a circle at (x, z) overlaps the collider's footprint. */
export function footprintOverlaps(c: Collider, x: number, z: number, r: number): boolean {
  if (c.kind === 'cylinder') {
    const dx = x - c.cx
    const dz = z - c.cz
    const reach = r + c.radius
    return dx * dx + dz * dz < reach * reach
  }
  toLocal(c, x, z)
  const px = localX - clamp(localX, -c.hx, c.hx)
  const pz = localZ - clamp(localZ, -c.hz, c.hz)
  return px * px + pz * pz < r * r
}

/** Output of {@link circleFootprintPush}: minimal XZ translation that separates the circle. */
export const pushResult = { x: 0, z: 0 }

/** Computes the push needed to move a circle out of a collider footprint. Returns false if not overlapping. */
export function circleFootprintPush(c: Collider, x: number, z: number, r: number): boolean {
  if (c.kind === 'cylinder') {
    const dx = x - c.cx
    const dz = z - c.cz
    const reach = r + c.radius
    const d2 = dx * dx + dz * dz
    if (d2 >= reach * reach) return false
    const d = Math.sqrt(d2)
    if (d < 1e-6) {
      pushResult.x = reach
      pushResult.z = 0
    } else {
      pushResult.x = (dx / d) * (reach - d)
      pushResult.z = (dz / d) * (reach - d)
    }
    return true
  }

  toLocal(c, x, z)
  const px = localX - clamp(localX, -c.hx, c.hx)
  const pz = localZ - clamp(localZ, -c.hz, c.hz)
  const d2 = px * px + pz * pz
  let lx: number
  let lz: number
  if (d2 > 1e-12) {
    if (d2 >= r * r) return false
    const d = Math.sqrt(d2)
    lx = (px / d) * (r - d)
    lz = (pz / d) * (r - d)
  } else {
    // Centre is inside the rectangle: exit through the nearest edge.
    const exitX = c.hx - Math.abs(localX)
    const exitZ = c.hz - Math.abs(localZ)
    if (exitX < exitZ) {
      lx = (localX >= 0 ? 1 : -1) * (exitX + r)
      lz = 0
    } else {
      lx = 0
      lz = (localZ >= 0 ? 1 : -1) * (exitZ + r)
    }
  }
  // Local -> world.
  pushResult.x = lx * c.cos + lz * c.sin
  pushResult.z = -lx * c.sin + lz * c.cos
  return true
}

// --- Ray casting (used by the camera to avoid clipping into geometry) ---

let slabMin = 0
let slabMax = 0

function slab(origin: number, dir: number, half: number): boolean {
  if (Math.abs(dir) < 1e-9) return Math.abs(origin) <= half
  let t1 = (-half - origin) / dir
  let t2 = (half - origin) / dir
  if (t1 > t2) {
    const tmp = t1
    t1 = t2
    t2 = tmp
  }
  if (t1 > slabMin) slabMin = t1
  if (t2 < slabMax) slabMax = t2
  return slabMin <= slabMax
}

function rayBox(c: BoxCollider, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number): number {
  const rx = ox - c.cx
  const rz = oz - c.cz
  const lox = rx * c.cos - rz * c.sin
  const loz = rx * c.sin + rz * c.cos
  const ldx = dx * c.cos - dz * c.sin
  const ldz = dx * c.sin + dz * c.cos
  const halfY = (c.top - c.bottom) / 2
  const loy = oy - (c.top + c.bottom) / 2
  slabMin = -Infinity
  slabMax = Infinity
  if (!slab(lox, ldx, c.hx) || !slab(loy, dy, halfY) || !slab(loz, ldz, c.hz)) return -1
  if (slabMax < 0 || slabMin < 0) return -1 // behind, or origin inside
  return slabMin
}

function rayCylinder(c: CylinderCollider, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number): number {
  const rx = ox - c.cx
  const rz = oz - c.cz
  const r2 = c.radius * c.radius
  let best = -1
  const a = dx * dx + dz * dz
  if (a > 1e-9) {
    const b = rx * dx + rz * dz
    const cc = rx * rx + rz * rz - r2
    const disc = b * b - a * cc
    if (disc >= 0) {
      const t = (-b - Math.sqrt(disc)) / a
      if (t >= 0) {
        const y = oy + dy * t
        if (y >= c.bottom && y <= c.top) best = t
      }
    }
  }
  if (Math.abs(dy) > 1e-9) {
    for (let i = 0; i < 2; i++) {
      const capY = i === 0 ? c.top : c.bottom
      const t = (capY - oy) / dy
      if (t >= 0 && (best < 0 || t < best)) {
        const x = rx + dx * t
        const z = rz + dz * t
        if (x * x + z * z <= r2) best = t
      }
    }
  }
  return best
}

/** Distance along a normalized ray to the nearest collider, or `maxDistance` if nothing is hit. */
export function raycastColliders(
  colliders: readonly Collider[],
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  maxDistance: number,
): number {
  let best = maxDistance
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i]
    const t = c.kind === 'box' ? rayBox(c, ox, oy, oz, dx, dy, dz) : rayCylinder(c, ox, oy, oz, dx, dy, dz)
    if (t >= 0 && t < best) best = t
  }
  return best
}
