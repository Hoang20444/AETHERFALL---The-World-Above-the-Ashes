---
name: threejs-game-skills
description: Game director, runtime architecture, and AAA-style visual rendering pipeline for Three.js and React Three Fiber browser games.
---

# Three.js Game Skills (Game Director)

`threejs-game-skills` acts as the technical director and gameplay systems architect for web 3D games. It bridges 3D models with runtime mechanics, camera systems, post-processing shaders, physics/collisions, and 60 FPS performance optimization.

---

## Architecture & Systems

### 1. Game Director Orchestration
- **Separation of Concerns:**
  - `PlayerRuntime.ts`: Deterministic player state (position, velocity, grounded state, input buffer, coyote time).
  - `CameraDirector.tsx`: Smooth third-person orbital camera with collision avoidance against terrain.
  - `World.tsx`: Spatial hierarchy of static colliders, dynamic platforms, and interactive triggers.
  - `RenderLoop`: Decoupled fixed-timestep physics update (`60hz`) from variable rendering framerate.

### 2. AAA Visual Pipeline & Post-Processing Stack
To elevate browser visuals to indie/AAA standards:
```tsx
import { EffectComposer, Bloom, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export function GamePostProcessing() {
  return (
    <EffectComposer disableNormalPass multisampling={4}>
      {/* Soft Contact Shadows in crevices and under feet */}
      <N8AO
        aoRadius={1.5}
        intensity={2.0}
        color="#080C14"
        distanceFalloff={0.8}
      />
      {/* Luminous Aether Core and Magic Runes */}
      <Bloom
        luminanceThreshold={0.85}
        luminanceSmoothing={0.3}
        intensity={1.2}
        mipmapBlur
      />
      {/* High Dynamic Range color preservation */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {/* Cinematic lens focus */}
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}
```

### 3. Third-Person Camera Dynamics
- Smooth spherical coordinates interpolation:
  - `azimuth` and `polar` angles respond to mouse / right stick.
  - Camera target follows player root + height offset (`1.4m`) using smooth exponential damp (`MathUtils.damp` or `damp3`).
  - Spring-arm occlusion check: Cast ray from player target to camera desired position; if an island or wall intersects, pull camera distance in to prevent seeing through geometry.

### 4. Atmospheric Layering
- **Layer 1: Sky & Atmosphere:** Sky hemisphere with subtle horizon gradient and atmospheric haze.
- **Layer 2: Volumetric Cloud Deck:** Semi-transparent noise-mapped planes or particle clusters drifting between islands.
- **Layer 3: Aether Sparks & Debris:** Instanced meshes with sine-wave vertical hovering (`@react-three/drei` `Sparkles`).
- **Layer 4: Fog:** Seamless exponential squared fog blending the horizon with sky color.

### 5. Web Performance Standards (60 FPS Target)
- **Draw Call Budget:** Keep total scene draw calls under `120`.
- **Geometry Instancing:** Use `<Instances>` or `InstancedMesh` for repeated rocks, ruin pillars, and grass blades.
- **Texture Budgets:** Max `2048x2048` for hero landmark atlases; `1024x1024` for tileable stones; `512x512` for props.
- **Garbage Collection:** Never instantiate new `Vector3`, `Matrix4`, or `Color` inside the `useFrame` render loop. Reuse module-level scratch variables.
