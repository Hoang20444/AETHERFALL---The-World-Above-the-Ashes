import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, PointLight } from 'three'
import { OctahedronGeometry } from 'three'
import { PALETTE } from '../GameConfig'
import { useGameSelector } from '../systems/GameState'
import { WAYSTONES } from './levelData'
import { getWorldMaterials } from './materials'
import { ModelAsset } from './ModelAsset'

interface WaystoneMarkerProps {
  checkpoint: number
  x: number
  y: number
  z: number
}

function WaystoneMarker({ checkpoint, x, y, z }: WaystoneMarkerProps) {
  const activeCheckpoint = useGameSelector((s) => s.checkpointIndex)
  const isAttuned = activeCheckpoint >= checkpoint
  const motesRef = useRef<Group>(null)
  const lightRef = useRef<PointLight>(null)

  const materials = useMemo(() => getWorldMaterials(), [])
  const moteGeom = useMemo(() => new OctahedronGeometry(0.045, 0), [])

  useFrame((state, delta) => {
    if (motesRef.current) {
      motesRef.current.rotation.y -= delta * 1.8
    }
    if (lightRef.current && isAttuned) {
      lightRef.current.intensity = 2.8 + Math.sin(state.clock.elapsedTime * 3) * 0.6
    }
  })

  return (
    <group position={[x, y, z]}>
      {/* --- Handcrafted Blender Waystone Checkpoint --- */}
      <ModelAsset
        url="/models/props/waystone_checkpoint.glb"
        position={[0, 0, 0]}
        scale={1.0}
        castShadow
        receiveShadow
      />

      {/* Orbiting cyan energy motes & resonance when attuned */}
      {isAttuned && (
        <>
          <group ref={motesRef} position={[0, 1.9, 0]}>
            <mesh geometry={moteGeom} material={materials.aether} position={[0.5, 0.1, 0]} />
            <mesh geometry={moteGeom} material={materials.aether} position={[-0.35, -0.15, 0.4]} />
            <mesh geometry={moteGeom} material={materials.aether} position={[-0.35, 0.2, -0.4]} />
          </group>

          <pointLight
            ref={lightRef}
            color={PALETTE.aether}
            intensity={2.8}
            distance={10}
            position={[0, 1.9, 0]}
          />
        </>
      )}
    </group>
  )
}

export function Waystones() {
  return (
    <group name="Waystones">
      {WAYSTONES.map((w) => (
        <WaystoneMarker
          key={w.checkpoint}
          checkpoint={w.checkpoint}
          x={w.x}
          y={w.y}
          z={w.z}
        />
      ))}
    </group>
  )
}
