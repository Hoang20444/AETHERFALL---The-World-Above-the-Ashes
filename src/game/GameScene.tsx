import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { CAMERA_CONFIG } from './GameConfig'
import { PlayerCamera } from './player/PlayerCamera'
import { PlayerController } from './player/PlayerController'
import { createCameraRig, createPlayerRuntime } from './player/PlayerRuntime'
import { gameStore } from './systems/GameState'
import { keyboard } from './systems/Input'
import { AncientMonument } from './world/AncientMonument'
import { Environment } from './world/Environment'
import { Platforms } from './world/Platforms'
import { Waystones } from './world/Waystones'
import { PostProcessing } from './systems/PostProcessing'

export function GameScene() {
  const runtime = useMemo(() => createPlayerRuntime(), [])
  const rig = useMemo(() => createCameraRig(), [])

  // Hook up keyboard input and focus-loss listeners
  useEffect(() => {
    const detach = keyboard.attach({
      onEscape: () => {
        gameStore.togglePause()
      },
      onFocusLost: () => {
        gameStore.pause()
      },
    })
    return detach
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        shadows
        camera={{
          fov: CAMERA_CONFIG.fov,
          near: 0.1,
          far: 500,
          position: [0, 5, 10],
        }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Environment />
          <Platforms />
          <AncientMonument />
          <Waystones />
          <PlayerController runtime={runtime} rig={rig} />
          <PlayerCamera runtime={runtime} rig={rig} />
          <PostProcessing />
        </Suspense>
      </Canvas>
    </div>
  )
}
