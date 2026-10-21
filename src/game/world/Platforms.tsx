import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { BufferGeometry, Group } from 'three'
import {
  BoxGeometry,
  CylinderGeometry,
  PlaneGeometry,
  RingGeometry,
  TorusGeometry,
} from 'three'
import { createPieceGeometry, getRockGeometry, hashId } from './geometry'
import { LEVEL_PIECES, type LevelPiece } from './levelData'
import { getStyleMaterials, getWorldMaterials } from './materials'
import { ModelAsset } from './ModelAsset'

interface PieceMeshProps {
  piece: LevelPiece
}

function PieceMesh({ piece }: PieceMeshProps) {
  const geometry = useMemo<BufferGeometry>(() => createPieceGeometry(piece), [piece])
  const mats = useMemo(() => getStyleMaterials(piece.style), [piece.style])
  const worldMats = useMemo(() => getWorldMaterials(), [])

  // Position: top of geometry is at piece.top, center of body is top - thickness/2
  const bodyY = piece.top - piece.thickness / 2
  const rockGeom = useMemo(() => {
    if (!piece.rock || piece.rock <= 0) return null
    return getRockGeometry(hashId(piece.id))
  }, [piece.id, piece.rock])

  const rockScale = useMemo<[number, number, number] | null>(() => {
    if (!piece.rock || piece.rock <= 0) return null
    if (piece.shape === 'cylinder') {
      return [piece.radius, piece.rock, piece.radius]
    }
    const maxHalf = Math.max(piece.width, piece.depth) * 0.55
    return [maxHalf, piece.rock, maxHalf]
  }, [piece])

  const yaw = piece.shape === 'box' ? piece.yaw ?? 0 : 0

  return (
    <group position={[piece.x, 0, piece.z]}>
      {/* Walkable solid platform */}
      <mesh
        geometry={geometry}
        material={piece.shape === 'box' ? mats.box : mats.cylinder}
        position={[0, bodyY, 0]}
        rotation={[0, yaw, 0]}
        receiveShadow
        castShadow
      />

      {/* Underside stratified rock crag */}
      {rockGeom && rockScale && (
        <mesh
          geometry={rockGeom}
          material={worldMats.rock}
          position={[0, piece.top - piece.thickness + 0.05, 0]}
          scale={rockScale}
          receiveShadow
        />
      )}
    </group>
  )
}

/** Decorative architectural elements: classical capitals, bridge rib arches, floating fracture shards */
function ArchitecturalDecorations() {
  const worldMats = useMemo(() => getWorldMaterials(), [])
  const floatingShardsRef = useRef<Group>(null)

  // Column capitals for archways and courtyard ruins
  const capitalGeom = useMemo(() => new BoxGeometry(1.05, 0.22, 1.05), [])
  const capitalRingGeom = useMemo(() => new TorusGeometry(0.5, 0.08, 8, 20), [])
  const archCorbelGeom = useMemo(() => new BoxGeometry(0.7, 0.5, 1.8), [])

  // Carved runic column sleeve with glowing cyan Aether runes
  const columnRuneGeom = useMemo(() => new CylinderGeometry(0.48, 0.52, 2.4, 12, 1, true), [])

  // Stylized foliage tufts (crossed quads with grass & white flowers)
  const foliageTuftGeom = useMemo(() => {
    const g = new PlaneGeometry(0.72, 0.58)
    g.translate(0, 0.28, 0)
    return g
  }, [])

  // Small cascading waterfall on courtyard edge
  const courtyardWaterfallGeom = useMemo(() => new CylinderGeometry(1.2, 1.8, 16, 10, 1, true, 0, Math.PI), [])

  // Severed bridge arch rib vaults beneath bridgeA and bridgeB
  const bridgeRibGeom = useMemo(() => new CylinderGeometry(1.4, 1.4, 0.45, 12, 1, false, 0, Math.PI), [])


  // Floor inlay ring on courtyard
  const mossPatchGeom2 = useMemo(() => new RingGeometry(0.4, 2.0, 7), [])

  // Cyan runic bands for ascending pillars
  const runeBandGeom = useMemo(() => new BoxGeometry(2.32, 0.12, 2.32), [])

  // Precomputed foliage tuft coordinates [x, y, z, rotY]
  const foliageLocations = useMemo(
    () => [
      // Starting Island rim & path cracks
      [-2.6, 0.01, 2.2, 0.3],
      [-3.1, 0.01, -1.6, 0.8],
      [2.8, 0.01, 2.4, -0.4],
      [3.2, 0.01, -3.2, 0.9],
      [-1.4, 0.01, -4.8, 0.2],
      [3.0, 0.01, -5.2, -0.6],
      // Stepping stones
      [-0.1, 0.32, -9.2, 0.5],
      [1.4, 0.52, -12.4, -0.7],
      [3.1, 0.72, -15.8, 0.4],
      [1.7, 0.82, -19.4, -0.3],
      // Broken bridge abutments
      [1.3, 1.05, -23.1, 0.6],
      [2.7, 1.05, -27.8, -0.5],
      [1.4, 1.05, -35.2, 0.8],
      // Courtyard edges and column bases
      [-1.9, 0.95, -42.4, 0.1],
      [4.8, 0.95, -45.1, -0.8],
      [0.9, 0.95, -47.1, 0.6],
    ],
    [],
  )

  useFrame((state) => {
    if (floatingShardsRef.current) {
      const t = state.clock.elapsedTime
      floatingShardsRef.current.position.y = Math.sin(t * 1.5) * 0.08
    }
  })

  return (
    <group name="ArchitecturalDecor">
      {/* --- Start Island Archway Columns & Glowing Runes --- */}
      <mesh
        geometry={capitalGeom}
        material={worldMats.ruin}
        position={[-1.3, 4.25, -5.4]}
        castShadow
      />
      <mesh
        geometry={capitalRingGeom}
        material={worldMats.gold}
        position={[-1.3, 4.05, -5.4]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Carved glowing cyan runic sleeve on left arch column */}
      <mesh
        geometry={columnRuneGeom}
        material={worldMats.runic}
        position={[-1.3, 1.8, -5.4]}
      />

      <mesh
        geometry={capitalGeom}
        material={worldMats.ruin}
        position={[3.1, 2.55, -5.6]}
        castShadow
      />
      <mesh
        geometry={capitalRingGeom}
        material={worldMats.gold}
        position={[3.1, 2.35, -5.6]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Carved glowing cyan runic sleeve on right arch column */}
      <mesh
        geometry={columnRuneGeom}
        material={worldMats.runic}
        position={[3.1, 1.25, -5.6]}
      />

      {/* --- Stylized Grass Tufts, Moss & Flowers across Walkways --- */}
      {foliageLocations.map(([fx, fy, fz, fRot], idx) => (
        <group key={idx} position={[fx, fy, fz]} rotation={[0, fRot, 0]}>
          <mesh geometry={foliageTuftGeom} material={worldMats.foliageCutout} />
          <mesh
            geometry={foliageTuftGeom}
            material={worldMats.foliageCutout}
            rotation={[0, Math.PI / 2, 0]}
          />
        </group>
      ))}

      {/* --- Cascading Waterfall on Courtyard Cliff Edge --- */}
      <mesh
        geometry={courtyardWaterfallGeom}
        material={worldMats.waterfall}
        position={[-3.6, -7, -44.0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* --- Natural Wildflower & Grass Tufts on Start Island --- */}
      <group position={[-2.2, 0.01, 1.8]}>
        <mesh geometry={foliageTuftGeom} material={worldMats.foliageCutout} scale={[1.2, 1.1, 1.2]} />
        <mesh geometry={foliageTuftGeom} material={worldMats.foliageCutout} rotation={[0, Math.PI / 2, 0]} scale={[1.2, 1.1, 1.2]} />
      </group>
      <group position={[2.5, 0.01, -1.5]}>
        <mesh geometry={foliageTuftGeom} material={worldMats.foliageCutout} scale={[1.1, 1.0, 1.1]} />
        <mesh geometry={foliageTuftGeom} material={worldMats.foliageCutout} rotation={[0, Math.PI / 2, 0]} scale={[1.1, 1.0, 1.1]} />
      </group>

      {/* --- Broken Bridge Understructure (Support Arches) --- */}
      <mesh
        geometry={bridgeRibGeom}
        material={worldMats.masonry}
        position={[2, 0.45, -24.5]}
        rotation={[0, 0, Math.PI]}
        castShadow
      />
      <mesh
        geometry={bridgeRibGeom}
        material={worldMats.masonry}
        position={[2, 0.45, -29.5]}
        rotation={[0, 0, Math.PI]}
        castShadow
      />
      <mesh
        geometry={bridgeRibGeom}
        material={worldMats.masonry}
        position={[2, 0.15, -36.0]}
        rotation={[0, 0, Math.PI]}
        castShadow
      />

      {/* --- Handcrafted Blender Architecture Kit: Ancient Archway Portal --- */}
      <ModelAsset
        url="/models/architecture/archway_segment.glb"
        position={[-1.3, 0.0, -5.4]}
        rotation={[0, 0, 0]}
        scale={1.0}
        castShadow
        receiveShadow
      />

      {/* --- Severed Floating Bridge Fracture Chunks (The Falling Chasm) --- */}
      <group ref={floatingShardsRef} position={[2, 0.8, -32.5]}>
        {/* Handcrafted Blender Floating Debris Pack with Aether Mineral Vein */}
        <ModelAsset
          url="/models/environment/floating_debris_pack.glb"
          position={[0, 0, 0]}
          scale={1.2}
          castShadow
        />
        {/* Subtle Aether resonance glow around the fracture gap */}
        <pointLight
          color={worldMats.aether.emissive}
          intensity={1.8}
          distance={10}
          position={[0, 0, 0]}
        />
      </group>

      {/* Handcrafted Blender Broken Bridge Deck at the Chasm Edge */}
      <ModelAsset
        url="/models/architecture/bridge_deck_broken.glb"
        position={[2.0, 0.5, -30.0]}
        scale={0.9}
        castShadow
        receiveShadow
      />

      {/* Handcrafted Blender Stepping Stone Cluster along Chasm Traversal */}
      <ModelAsset
        url="/models/environment/stepping_stone_cluster.glb"
        position={[0.8, 0.2, -14.2]}
        scale={1.0}
        castShadow
        receiveShadow
      />

      {/* --- Ruined Courtyard Handcrafted Blender Fluted & Broken Columns --- */}
      <ModelAsset
        url="/models/architecture/modular_pillar_fluted.glb"
        position={[-0.6, 0.9, -46.9]}
        scale={1.15}
        castShadow
        receiveShadow
      />
      <ModelAsset
        url="/models/architecture/modular_pillar_broken.glb"
        position={[5.4, 0.9, -41.0]}
        scale={1.2}
        castShadow
        receiveShadow
      />

      {/* Ancient Runic Inlay Ring on Courtyard Floor */}
      <mesh
        geometry={mossPatchGeom2}
        material={worldMats.aetherRune}
        position={[2.5, 0.91, -44.0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* --- Ascending Pillars Glowing Runic Bands --- */}
      <mesh geometry={runeBandGeom} material={worldMats.aetherRune} position={[7.2, 1.8, -46.5]} />
      <mesh geometry={runeBandGeom} material={worldMats.aetherRune} position={[8.6, 3.0, -49.6]} scale={[0.92, 1, 0.92]} />
      <mesh geometry={runeBandGeom} material={worldMats.aetherRune} position={[6.4, 4.2, -52.4]} scale={[0.92, 1, 0.92]} />
      <mesh geometry={runeBandGeom} material={worldMats.aetherRune} position={[3.6, 5.2, -54.6]} scale={[0.92, 1, 0.92]} />

      {/* --- Plateau Entrance Pylon Corbels --- */}
      <mesh geometry={archCorbelGeom} material={worldMats.ruin} position={[-2.4, 7 + 3.4, -62.5]} castShadow />
      <mesh geometry={archCorbelGeom} material={worldMats.ruin} position={[8.6, 7 + 1.6, -62.0]} castShadow />

      {/* --- Handcrafted Blender Geological Rock Islands (Underside Strata) --- */}
      <ModelAsset
        url="/models/environment/island_rock_large.glb"
        position={[0, -0.4, 0]}
        scale={1.0}
        receiveShadow
      />
      <ModelAsset
        url="/models/environment/island_rock_medium.glb"
        position={[2.5, 0.5, -45.0]}
        scale={1.15}
        receiveShadow
      />
    </group>
  )
}

export function Platforms() {
  return (
    <group name="Platforms">
      {LEVEL_PIECES.map((piece) => (
        <PieceMesh key={piece.id} piece={piece} />
      ))}
      <ArchitecturalDecorations />
    </group>
  )
}
