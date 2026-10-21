import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import type { Group, PointLight } from 'three'
import {
  AdditiveBlending,
  CylinderGeometry,
  DoubleSide,
  MeshBasicMaterial,
  OctahedronGeometry,
} from 'three'
import { PALETTE } from '../GameConfig'
import { MONUMENT } from './levelData'
import { getWorldMaterials } from './materials'
import { ModelAsset } from './ModelAsset'

export function AncientMonument() {
  const materials = useMemo(() => getWorldMaterials(), [])
  const coreRef = useRef<Group>(null)
  const lightRef = useRef<PointLight>(null)

  // Cascading sanctuary waterfalls pouring off monument cliffs
  const monumentWaterfallGeom = useMemo(() => new CylinderGeometry(2.4, 3.8, 34, 12, 1, true, 0, Math.PI), [])

  // Floating satellite monoliths
  const floatingMonolithGeom = useMemo(() => new CylinderGeometry(0.32, 0.52, 4.2, 4), [])
  const spireCapGeom = useMemo(() => new OctahedronGeometry(0.24, 0), [])
  const satelliteGroupRef = useRef<Group>(null)

  // Soft sky beacon light beam rising into clouds
  const beaconGeom = useMemo(() => new CylinderGeometry(0.4, 1.8, 85, 16, 1, true), [])
  const beaconMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: PALETTE.aether,
        transparent: true,
        opacity: 0.14,
        blending: AdditiveBlending,
        side: DoubleSide,
        depthWrite: false,
      }),
    [],
  )

  const coreBaseY = useMemo(() => {
    let totalHeight = MONUMENT.baseY
    for (const tier of MONUMENT.tiers) {
      totalHeight += tier.height
    }
    return totalHeight + MONUMENT.obeliskHeight + 1.45
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // Core levitation and gentle axial precession
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.7
      coreRef.current.rotation.x = Math.sin(t * 1.1) * 0.12
      coreRef.current.position.y = coreBaseY + Math.sin(t * 1.8) * 0.22
    }

    // Floating satellite monoliths gentle rotation & bobbing
    if (satelliteGroupRef.current) {
      satelliteGroupRef.current.rotation.y += delta * 0.25
      satelliteGroupRef.current.position.y = Math.sin(t * 1.2) * 0.3
    }

    // Gentle breathing pulse on point light
    if (lightRef.current) {
      lightRef.current.intensity = 4.8 + Math.sin(t * 3.2) * 0.85
    }
  })

  return (
    <group position={[MONUMENT.x, 0, MONUMENT.z]}>
      {/* --- Handcrafted Blender Landmark: Ancient Monument Citadel --- */}
      <ModelAsset
        url="/models/landmarks/ancient_monument_citadel.glb"
        position={[0, MONUMENT.baseY, 0]}
        scale={1.05}
        castShadow
        receiveShadow
      />

      {/* --- Cascading Sanctuary Waterfalls Pouring off Dais Cliffs --- */}
      <mesh
        geometry={monumentWaterfallGeom}
        material={materials.waterfall}
        position={[-6.2, MONUMENT.baseY - 14, -2]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <mesh
        geometry={monumentWaterfallGeom}
        material={materials.waterfall}
        position={[6.2, MONUMENT.baseY - 14, 2]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* --- Floating Satellite Monoliths in Mid-Air --- */}
      <group ref={satelliteGroupRef}>
        <group position={[-8.5, coreBaseY + 2, -4.5]} rotation={[0.2, 0.4, -0.15]}>
          <mesh geometry={floatingMonolithGeom} material={materials.monumentStone} castShadow />
          <mesh geometry={spireCapGeom} material={materials.monumentGold} position={[0, 2.3, 0]} />
        </group>
        <group position={[8.5, coreBaseY + 1, -3.5]} rotation={[-0.2, -0.3, 0.2]}>
          <mesh geometry={floatingMonolithGeom} material={materials.monumentStone} castShadow />
          <mesh geometry={spireCapGeom} material={materials.monumentGold} position={[0, 2.3, 0]} />
        </group>
        <group position={[-5.2, coreBaseY - 1.5, 6.5]} rotation={[0.15, 0.6, 0.1]}>
          <mesh geometry={floatingMonolithGeom} material={materials.monumentStone} castShadow />
          <mesh geometry={spireCapGeom} material={materials.monumentGold} position={[0, 2.3, 0]} />
        </group>
        <group position={[6.5, coreBaseY + 3.2, 5.8]} rotation={[-0.25, 0.8, -0.1]}>
          <mesh geometry={floatingMonolithGeom} material={materials.monumentStone} castShadow />
          <mesh geometry={spireCapGeom} material={materials.monumentGold} position={[0, 2.3, 0]} />
        </group>
      </group>

      {/* --- Levitating Blender Aether Core & Astral Gyroscope Rings --- */}
      <group ref={coreRef} position={[0, coreBaseY + 1.2, 0]}>
        <ModelAsset
          url="/models/landmarks/aether_core_astral.glb"
          position={[0, 0, 0]}
          scale={1.25}
          castShadow
        />

        {/* Dynamic Aether Point Light */}
        <pointLight
          ref={lightRef}
          color={PALETTE.aether}
          intensity={4.8}
          distance={28}
          decay={2}
        />

        {/* Orbiting Magical Aether Motes & Sparkles */}
        <Sparkles
          count={45}
          scale={[8, 7, 8]}
          size={5}
          speed={0.35}
          color={PALETTE.aether}
          opacity={0.8}
        />
      </group>

      {/* --- Soft Vertical Sky Pillar (Aether Beacon) --- */}
      <mesh
        geometry={beaconGeom}
        material={beaconMat}
        position={[0, coreBaseY + 40, 0]}
      />
    </group>
  )
}
