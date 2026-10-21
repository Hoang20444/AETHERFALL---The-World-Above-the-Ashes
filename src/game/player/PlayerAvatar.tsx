import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { PLAYER_CONFIG } from '../GameConfig'
import type { PlayerStateMachine } from './PlayerState'

useGLTF.preload('/models/characters/kael.glb')

export function PlayerAvatar({ state }: { state: PlayerStateMachine }) {
  const root = useRef<Group>(null)
  const avatarRef = useRef<Group>(null)

  // Load rigged Kael model with Blender NLA animations
  const { scene, animations } = useGLTF('/models/characters/kael.glb')

  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene)
    c.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return c
  }, [scene])

  const { actions } = useAnimations(animations, avatarRef)
  const currentAction = useRef<string>('')

  useFrame((_, rawDelta) => {
    const group = root.current
    if (!group) return
    const dt = Math.min(rawDelta, 0.1)

    // Instantaneous animation state switching in animation loop
    let actionName = 'Kael_Idle'
    if (state.current === 'run') {
      actionName = 'Kael_Run'
    } else if (state.current === 'jump') {
      actionName = 'Kael_Jump'
    } else if (state.current === 'fall') {
      actionName = 'Kael_Fall'
    } else if (state.current === 'land') {
      actionName = 'Kael_Land'
    }

    if (actionName !== currentAction.current && actions) {
      const prev = currentAction.current ? actions[currentAction.current] : null
      const next = actions[actionName]

      if (next) {
        next.reset()
        if (prev) {
          next.crossFadeFrom(prev, 0.15, true)
        }
        next.play()
        currentAction.current = actionName
      }
    }

    // Dynamic athletic lean when moving or jumping
    const speedRatio = Math.min(state.horizontalSpeed / PLAYER_CONFIG.sprintSpeed, 1)
    const airborne = state.current === 'jump' || state.current === 'fall'
    const targetLean = airborne ? (state.current === 'jump' ? -0.06 : 0.08) : speedRatio * 0.14
    group.rotation.x += (targetLean - group.rotation.x) * (1 - Math.exp(-12 * dt))

    // Subtle landing compression
    let targetScaleY = 1.0
    if (state.current === 'land') targetScaleY = 0.92
    else if (state.current === 'jump') targetScaleY = 1.03
    group.scale.y += (targetScaleY - group.scale.y) * (1 - Math.exp(-(targetScaleY < 1 ? 28 : 12) * dt))
  })

  return (
    <group ref={root}>
      <group ref={avatarRef}>
        <primitive object={clone} />
      </group>
    </group>
  )
}
