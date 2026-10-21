# AETHERFALL — Blender to Three.js / R3F Asset Pipeline Specification

This document defines the standardized asset pipeline for integrating 3D character and environment models created in Blender into **AETHERFALL**.

---

## 1. Coordinate Conventions & Units

| Property | Blender Convention | R3F / Three.js Runtime | Conversion Notes |
| :--- | :--- | :--- | :--- |
| **Units** | Metric, Unit Scale = `1.0` | 1 unit = 1 meter | Keep 1:1 scale |
| **Up Vector** | **+Z** | **+Y** | Standard GLTF exporter converts automatically (`+Y Up` checked) |
| **Character Forward** | **-Y** | **+Z** | Standard humanoid orientation facing runtime forward |
| **Character Feet** | `Z = 0.0` (Origin at sole of feet) | `Y = 0.0` | Crucial for ground detection and cylinder collision |
| **Character Height** | `1.75m` | `1.75` | Configured in `PLAYER_CONFIG.height` |
| **Character Radius** | `0.35m` | `0.35` | Configured in `PLAYER_CONFIG.radius` |

---

## 2. Character Creation & Rigging Standards (Kael)

### Armature Hierarchy
- Root Bone: `Root` (at ground level `0, 0, 0`).
- Pelvis / Hips: child of Root.
- Standard humanoid naming (e.g. `Spine`, `Chest`, `Neck`, `Head`, `UpperArm.L`, `Forearm.L`, `Hand.L`, `Thigh.L`, `Shin.L`, `Foot.L`, etc.).
- Keep total deformation bones under **64** for optimal browser skinning performance.
- Avoid unapplied scales or rotations on armature or mesh before rigging!

### Transforms Checklist before Export
1. Select armature and meshes.
2. Press `Ctrl + A` -> **Apply All Transforms** (Location, Rotation, Scale).
3. Ensure Scale is `(1.0, 1.0, 1.0)`.
4. Ensure Origin point of the character mesh and armature is at `(0, 0, 0)` (base of feet).

---

## 3. Locomotion Animation Architecture

The character state machine (`src/game/player/PlayerState.ts`) maps runtime locomotion states directly to Blender NLA Actions / Animation Clips.

### Required NLA Action Names:
| Action Name in Blender | Runtime State | Loop Mode | Description |
| :--- | :--- | :--- | :--- |
| **`Idle`** | `idle` | Loop | Calm, breathing stance, eyes forward |
| **`Walk`** | `walk` | Loop | Deliberate, grounded exploration step (~4.6 m/s) |
| **`Run`** | `run` | Loop | Urgent sprint traversal (~8.2 m/s) |
| **`Jump`** | `jump` | Clamp / Hold | Upward launch anticipation and rise |
| **`Fall`** | `fall` | Loop | Controlled descent, wind through cloak |
| **`Land`** | `land` | Once | Quick recovery squash (~0.16s duration) |
| *`Dash`* | *Phase 2: aether-dash* | Once | Forward burst with trail effect |

> **Note on Root Motion:**  
> All animations should be exported in-place (no horizontal root bone translation), as displacement is integrated kinematically by `PlayerMovement.ts`.

---

## 4. Materials and PBR Standards

- Use the **Principled BSDF** node in Blender.
- Roughness-Metallic workflow:
  - Base Color (sRGB)
  - Roughness / Metallic (Linear Non-Color)
  - Normal Map (OpenGL format, +Y tangent space)
  - Emission Map (for magical Aether cyan inlays `#5FF0FF`)
- Textures:
  - Max resolution for character: 2048x2048.
  - Max resolution for environment props: 1024x1024 or 512x512.
  - Format: PNG or optimized WebP.

---

## 5. Blender GLB/GLTF Export Settings

In Blender: `File` -> `Export` -> `glTF 2.0 (.glb/.gltf)`.

### Recommended Preset Settings:
- **Format:** `glTF Binary (.glb)` (packs mesh, textures, and skeleton into a single optimized file).
- **Include:**
  - [x] `Selected Objects` (select character + armature)
  - [x] `Custom Properties`
- **Transform:**
  - [x] `+Y Up`
- **Geometry:**
  - [x] `Apply Modifiers` (ensure Armature modifier is NOT applied destructively, but subsurf or mirror are applied)
  - [x] `Normals`
  - [x] `Tangents` (if using normal maps)
- **Armature:**
  - [x] `Export Deformation Bones Only`
- **Animation:**
  - [x] `Animation`
  - [x] `Group by NLA Track`
  - [x] `Export All Actions` (or push each action onto an NLA track)
  - Max tolerance: `0.001`

Target destination in project: `public/models/kael.glb` or `public/models/props/*.glb`.

---

## 6. Integrating into React Three Fiber

In Phase 2, `src/game/player/PlayerAvatar.tsx` can be swapped with `@react-three/drei`'s `useGLTF` and `useAnimations`:

```tsx
import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { PlayerStateMachine } from './PlayerState'
import { ANIMATION_CLIPS } from './PlayerState'

export function BlenderPlayerAvatar({ state }: { state: PlayerStateMachine }) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/kael.glb')
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const clipName = ANIMATION_CLIPS[state.current]
    const action = actions[clipName]
    if (action) {
      action.reset().fadeIn(0.15).play()
      return () => { action.fadeOut(0.15) }
    }
  }, [state.current, actions])

  return <primitive ref={group} object={scene} />
}

useGLTF.preload('/models/kael.glb')
```

---

## 7. QA Verification Checklist
1. **Scale Check:** Compare imported model height against the 1.75m collision cylinder (`PLAYER_CONFIG.height`).
2. **Facing Check:** Ensure model faces toward +Z by default (looking down the path at -Z when spawned).
3. **Clip Blending:** Verify smooth cross-fading when transitioning between `Walk` -> `Run` -> `Jump` -> `Fall` -> `Land`.
4. **Draw Call Impact:** Inspect with Chrome DevTools or Spector.js to ensure material sharing and batched instancing.
