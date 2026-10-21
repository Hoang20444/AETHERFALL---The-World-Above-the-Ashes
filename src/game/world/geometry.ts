import type { BufferGeometry } from 'three'
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
} from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PALETTE } from '../GameConfig'
import type { LevelPiece } from './levelData'
import { fbm3 } from './noise'

/** World-space size (m) of one texture repeat. */
const TOP_TILE = 2.8
const SIDE_TILE = 2.4

/** Box with world-scaled UVs and subtle edge bevel simulation for masonry. */
export function createScaledBox(width: number, height: number, depth: number): BoxGeometry {
  const geometry = new BoxGeometry(width, height, depth)
  const uv = geometry.attributes.uv
  const faceScale: [number, number][] = [
    [depth / SIDE_TILE, height / SIDE_TILE],
    [depth / SIDE_TILE, height / SIDE_TILE],
    [width / TOP_TILE, depth / TOP_TILE],
    [width / TOP_TILE, depth / TOP_TILE],
    [width / SIDE_TILE, height / SIDE_TILE],
    [width / SIDE_TILE, height / SIDE_TILE],
  ]
  for (let face = 0; face < 6; face++) {
    const [su, sv] = faceScale[face]
    for (let v = 0; v < 4; v++) {
      const i = face * 4 + v
      uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
    }
  }
  return geometry
}

/** Cylinder with world-scaled planar UVs on caps to eliminate concentric distortion. */
export function createScaledCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments = 32,
): CylinderGeometry {
  const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1)
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  const torsoCount = (radialSegments + 1) * 2
  const sideU = (Math.PI * 2 * Math.max(radiusTop, radiusBottom)) / SIDE_TILE
  const sideV = height / SIDE_TILE

  for (let i = 0; i < uv.count; i++) {
    if (i < torsoCount) {
      uv.setXY(i, uv.getX(i) * sideU, uv.getY(i) * sideV)
    } else {
      // Natural planar UV projection from vertex X/Z coordinates
      const px = pos.getX(i)
      const pz = pos.getZ(i)
      uv.setXY(i, px / TOP_TILE, pz / TOP_TILE)
    }
  }
  return geometry
}

export function createPieceGeometry(piece: LevelPiece): BufferGeometry {
  if (piece.shape === 'box') {
    return createScaledBox(piece.width, piece.thickness, piece.depth)
  }
  const segments = piece.radius > 3 ? 36 : piece.radius > 1 ? 24 : 14
  return createScaledCylinder(piece.radius, piece.radius, piece.thickness, segments)
}

const rockCache = new Map<number, BufferGeometry>()

/**
 * Hanging geological rock crag mass for floating islands:
 *  - Geologically stratified shelves (stepped horizontal fracture ledges).
 *  - Multi-faceted angular crags with natural lean.
 *  - Rich vertex color gradient from lush mossy rim down to dark basalt abyss rock.
 */
export function getRockGeometry(variant: number): BufferGeometry {
  const key = variant % 6
  const existing = rockCache.get(key)
  if (existing) return existing

  const seed = key * 17.41 + 2.3
  // 18 radial segments, 14 height rings for faceted geological strata
  let geometry: BufferGeometry = new CylinderGeometry(1, 1, 1, 18, 14, true)
  geometry.translate(0, -0.5, 0)
  geometry.deleteAttribute('uv')
  geometry.deleteAttribute('normal')
  geometry = mergeVertices(geometry)

  const position = geometry.attributes.position
  const colors = new Float32Array(position.count * 3)
  const topColor = new Color(PALETTE.rockTop)
  const midColor = new Color(PALETTE.rockMid)
  const botColor = new Color(PALETTE.rockBottom)
  const color = new Color()

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)
    const t = -y // 0 at top rim, 1 at bottom tip

    // Geological horizontal strata stepping
    const strata = Math.floor(t * 8) / 8
    const strataStep = (t - strata) * 8 // 0..1 inside shelf
    const shelfLedge = strataStep > 0.85 ? 0.08 : 0

    // Multi-octave 3D noise for crag crevices and facets
    const n = fbm3(x * 1.8 + seed, y * 3.2 + seed * 0.5, z * 1.8 - seed, 4)
    const angle = Math.atan2(z, x)
    // Faceted angular ridges around perimeter
    const facet = Math.cos(angle * 4 + seed) * 0.12 + Math.sin(angle * 7) * 0.06

    // Tapering profile with sharp geological break shelves
    const baseProfile = t < 0.04 ? 1.0 : Math.pow(1.0 - (t - 0.04) / 0.96, 1.35) * 0.92 + 0.05
    const radius = baseProfile * (0.8 + n * 0.45 + facet + shelfLedge)

    // Asymmetric lean so islands have dynamic silhouette
    const lean = t * t * 0.32
    const leanX = lean * Math.sin(seed * 1.2)
    const leanZ = lean * Math.cos(seed * 1.2)

    position.setXYZ(
      i,
      x * radius + leanX,
      y + (n - 0.5) * 0.12 * Math.min(t * 6, 1),
      z * radius + leanZ,
    )

    // Stratified color gradient with moss highlights on upper ledges
    if (t < 0.15) {
      color.lerpColors(topColor, midColor, t / 0.15)
    } else {
      const botRatio = Math.min((t - 0.15) / 0.75, 1.0)
      color.lerpColors(midColor, botColor, botRatio)
    }
    // Highlighting ledges and crevices
    const shade = 0.78 + n * 0.4 + (strataStep > 0.85 ? 0.15 : 0)
    colors[i * 3] = color.r * shade
    colors[i * 3 + 1] = color.g * shade
    colors[i * 3 + 2] = color.b * shade
  }

  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  rockCache.set(key, geometry)
  return geometry
}

/** Stable small integer from a string id (for picking rock variants). */
export function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0
  return Math.abs(h)
}
