import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import type { Mesh } from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

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
    const c = SkeletonUtils.clone(scene)
    c.traverse((child) => {
      if ((child as Mesh).isMesh) {
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
