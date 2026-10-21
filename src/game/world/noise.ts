/** Deterministic noise helpers for procedural geometry (no Math.random, stable between reloads). */

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash3(ix: number, iy: number, iz: number): number {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(iz, 1440662683)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}

const fade = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function valueNoise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = fade(x - ix)
  const fy = fade(y - iy)
  const fz = fade(z - iz)
  const x00 = lerp(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), fx)
  const x10 = lerp(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), fx)
  const x01 = lerp(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), fx)
  const x11 = lerp(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), fx)
  return lerp(lerp(x00, x10, fy), lerp(x01, x11, fy), fz)
}

export function fbm3(x: number, y: number, z: number, octaves = 4): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  let total = 0
  for (let i = 0; i < octaves; i++) {
    value += amplitude * valueNoise3(x * frequency, y * frequency, z * frequency)
    total += amplitude
    amplitude *= 0.5
    frequency *= 2.03
  }
  return value / total
}
