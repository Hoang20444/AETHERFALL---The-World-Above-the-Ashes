# AETHERFALL — 3D Asset Integration Guide

This guide documents how custom Blender `.glb` assets are loaded and integrated into the React Three Fiber game world.

## 1. Asset Directories
- `public/models/environment/`: Rock islands, crags, stepping stones, debris.
- `public/models/architecture/`: Modular pillars, arches, bridge decks, walls.
- `public/models/landmarks/`: Ancient Monument citadel, astral Aether core.
- `public/models/props/`: Checkpoint Waystone, relic pedestals, interactive objects.
- `public/models/characters/`: Kael and story NPCs.

## 2. Reusable Component Pattern (`ModelAsset`)
A declarative component wrapping `useGLTF` with clone support, shadow toggles, and fallback:

```tsx
import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

interface ModelAssetProps {
  url: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number] | number
  castShadow?: boolean
  receiveShadow?: boolean
}

export function ModelAsset({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
}: ModelAssetProps) {
  const { scene } = useGLTF(url)
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = castShadow
        child.receiveShadow = receiveShadow
      }
    })
    return c
  }, [scene, castShadow, receiveShadow])

  return (
    <primitive
      object={clone}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  )
}
```

## 3. Collision Preservation Rule
The game's kinematic platforming controller uses `Collision.ts` and `levelData.ts` as the authoritative source of truth for walkable cylinders and boxes. Visual GLB assets decorate and elevate the aesthetic without overriding the rock-solid gameplay collision geometry.
