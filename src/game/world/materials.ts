import type { Material } from 'three'
import { Color, MeshStandardMaterial } from 'three'
import { PALETTE } from '../GameConfig'
import type { PieceStyle } from './levelData'
import { DoubleSide } from 'three'
import {
  getFlagstoneTexture,
  getFoliageTexture,
  getMasonryTexture,
  getRunicTexture,
  getWaterfallTexture,
} from './textures'

/**
 * Shared world materials. One instance per surface type, reused by every mesh,
 * so the renderer can batch state changes and memory stays low.
 */
export interface WorldMaterials {
  flagstone: MeshStandardMaterial
  bridgeDeck: MeshStandardMaterial
  masonry: MeshStandardMaterial
  ruin: MeshStandardMaterial
  monumentStone: MeshStandardMaterial
  monumentGold: MeshStandardMaterial
  rock: MeshStandardMaterial
  moss: MeshStandardMaterial
  foliage: MeshStandardMaterial
  foliageCutout: MeshStandardMaterial
  runic: MeshStandardMaterial
  waterfall: MeshStandardMaterial
  gold: MeshStandardMaterial
  aether: MeshStandardMaterial
  aetherCore: MeshStandardMaterial
  aetherRune: MeshStandardMaterial
}

let materials: WorldMaterials | null = null

export function getWorldMaterials(): WorldMaterials {
  if (materials) return materials
  const flagstoneMap = getFlagstoneTexture()
  const masonryMap = getMasonryTexture()
  const runicMap = getRunicTexture()
  const foliageMap = getFoliageTexture()
  const waterfallMap = getWaterfallTexture()

  materials = {
    flagstone: new MeshStandardMaterial({ color: '#ffffff', map: flagstoneMap, roughness: 0.85 }),
    bridgeDeck: new MeshStandardMaterial({ color: '#f0ece2', map: flagstoneMap, roughness: 0.86 }),
    masonry: new MeshStandardMaterial({ color: PALETTE.stoneSide, map: masonryMap, roughness: 0.94 }),
    ruin: new MeshStandardMaterial({ color: PALETTE.ruin, map: masonryMap, roughness: 0.92 }),
    monumentStone: new MeshStandardMaterial({ color: PALETTE.monumentStone, map: masonryMap, roughness: 0.76, metalness: 0.08 }),
    monumentGold: new MeshStandardMaterial({ color: PALETTE.monumentGold, roughness: 0.32, metalness: 0.82 }),
    rock: new MeshStandardMaterial({ vertexColors: true, roughness: 1.0 }),
    moss: new MeshStandardMaterial({ color: PALETTE.moss, roughness: 1.0 }),
    foliage: new MeshStandardMaterial({ color: PALETTE.grass, roughness: 0.95 }),
    foliageCutout: new MeshStandardMaterial({
      map: foliageMap,
      transparent: true,
      alphaTest: 0.28,
      side: DoubleSide,
      roughness: 0.9,
    }),
    runic: new MeshStandardMaterial({
      color: '#ffffff',
      map: runicMap,
      emissive: new Color(PALETTE.aetherRune),
      emissiveIntensity: 0.85,
      roughness: 0.65,
    }),
    waterfall: new MeshStandardMaterial({
      map: waterfallMap,
      color: new Color('#bbf8ff'),
      transparent: true,
      opacity: 0.88,
      roughness: 0.12,
      emissive: new Color('#2dbdce'),
      emissiveIntensity: 0.45,
      side: DoubleSide,
      depthWrite: false,
    }),
    gold: new MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.4, metalness: 0.75 }),
    aether: new MeshStandardMaterial({
      color: new Color('#0a2328'),
      emissive: new Color(PALETTE.aether),
      emissiveIntensity: 2.6,
      roughness: 0.25,
    }),
    aetherCore: new MeshStandardMaterial({
      color: new Color('#062227'),
      emissive: new Color(PALETTE.aetherCore),
      emissiveIntensity: 3.6,
      roughness: 0.12,
    }),
    aetherRune: new MeshStandardMaterial({
      color: new Color('#163038'),
      emissive: new Color(PALETTE.aetherRune),
      emissiveIntensity: 1.8,
      roughness: 0.4,
    }),
  }
  return materials
}

export interface StyleMaterials {
  /** BoxGeometry face order: +x, -x, +y (top), -y, +z, -z */
  box: Material[]
  /** CylinderGeometry groups: side, top, bottom */
  cylinder: Material[]
}

const styleCache = new Map<PieceStyle, StyleMaterials>()

/** Walkable tops use lighter flagstones; sides use darker masonry for readability. */
export function getStyleMaterials(style: PieceStyle): StyleMaterials {
  const cached = styleCache.get(style)
  if (cached) return cached
  const m = getWorldMaterials()
  let top: Material = m.flagstone
  let side: Material = m.masonry
  if (style === 'bridge') top = m.bridgeDeck
  if (style === 'ruin' || style === 'curb') {
    top = m.ruin
    side = m.ruin
  }
  const result: StyleMaterials = {
    box: [side, side, top, side, side, side],
    cylinder: [side, top, side],
  }
  styleCache.set(style, result)
  return result
}
