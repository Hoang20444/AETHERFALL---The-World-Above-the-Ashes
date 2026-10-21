---
name: 3dviz-pro-max
description: Design and build expressive 3D scenes, cinematic environments, explainers, and interactive game worlds using Three.js, React Three Fiber, and Blender.
---

# 3Dviz Pro Max

3Dviz Pro Max equips the AI agent with spatial reasoning, 3D geometry construction, cinematic lighting, material authoring, and WebGL optimization. Use this skill whenever designing, building, or refining 3D scenes, game environments, characters, or interactive 3D web applications.

---

## 10-Step Creative 3D Workflow

For any new 3D scene, character, or environment task, execute the following 10 steps. For existing scenes, inspect the current state first and apply only the relevant steps.

### 1. Intent & Visual Direction
- **Emotional tone & core hook:** What should the viewer feel (e.g. ancient mystery, awe, atmospheric solitude)?
- **Visual hierarchy:** Establish a primary focal point (e.g. Glowing Citadel Core), secondary landmarks (floating spires, arches), and background silhouettes (distant floating islands, clouds).
- **Color Palette & Value Grading:** Restrict palette to 3–4 cohesive tones (e.g. Charcoal `#15181E`, Slate Blue `#3A4B5C`, Pale Gold `#C2A66A`, and Aether Cyan `#00F0FF`). Dark values must retain detail; never crush shadows to pure pitch black.
- **Viewing Distance:** Calibrate level-of-detail for Third-Person player camera (5m–25m orbit) vs. First-Person vs. Isometric.

### 2. Object Reasoning & Craft
Before placing or generating geometry:
- **Silhouette check:** Does each object have an instantly recognizable silhouette from all gameplay camera angles?
- **Proportion & Scale:** Ground all objects to a consistent metric unit (e.g. Human character = 1.75m–1.85m tall; doorways = 3.0m; spires = 12m–25m).
- **Sub-part breakdown:** Divide complex assets into Primary mass (base structure), Secondary detail (steps, friezes, cornices), and Tertiary detail (surface runes, edge bevels, moss in crevices).
- **Visual weight:** Anchor floating structures with visible energy conduits, counter-weights, or bottom rock roots.

### 3. Representation Grounding & PBR
- **Material Realism vs. Stylized Expression:** Use stylized Physically Based Rendering (PBR) — roughness maps with subtle hand-painted variation, metallic accents for ancient gold/brass, and high-intensity emissive channels for magical energy.
- **Avoid flat surfaces:** Never use untextured, flat-shaded default materials. Apply normal maps, subtle procedural vertex colors, or multi-tone tileable textures with micro-chisel bevels.
- **UV Layout & Texturing:** Ensure non-distorted UV mapping (use planar world-space UVs for terrain/floors to eliminate polar pinching or concentric circle artifacts).

### 4. Construction Routing
Choose the optimal construction path:
- **Blender MCP (Preferred for complex assets):** Sculpt organic rocks, character anatomy, multi-layered clothing, and modular architecture with bevel modifiers and smooth shading.
- **Procedural / Shader (Preferred for infinite elements):** Sky domes, dynamic cloud layers, water planes, aether particle streams.
- **Curated Asset Imports:** Verified game-ready GLTF/GLB models for secondary foliage, props, and standard hero animations.

### 5. Cinematic Lighting & Atmosphere
- **Key Light (Directional Sunlight):** Warm, low-angle golden sun (color: `#FFE5B4`, intensity: `2.0 - 2.8`) casting crisp, filtered shadows.
- **Hemisphere & Ambient Fill:** Sky light (`#5D7F9E`) + Ground bounce (`#1E252E`), ensuring shadow areas are illuminated with rich blue-slate tones instead of pure black.
- **Accent & Emissive Lights:** Cyan point lights (`#00F0FF`, intensity: `4.0 - 10.0`) attached to runes, cores, and magic crystals with realistic quadratic falloff.
- **Depth & Fog:** Height-based fog or Exponential Squared Fog (`#1A222D`) blending distant islands seamlessly into the sky background.

### 6. First View & Camera Framing
- **Rule of Thirds & Golden Ratio:** Align major landmarks with the upper or lateral third of the screen.
- **Layering:** Always structure the view into 3 distinct depth planes:
  1. *Foreground:* Floating debris, player cloak, cliff edge frame.
  2. *Midground:* Playable island, ancient monument, interactive puzzles.
  3. *Background:* Distant floating archipelagos, layered volumetric cloud decks, horizon glow.

### 7. Meaningful Dynamic Behavior
- **Ambient Life:** Idle animations for characters, wind blowing cloth/hair, slow rotation for floating rings, gentle hovering oscillation (`Math.sin(time) * 0.15`).
- **Interactive Feedback:** Visual feedback on player interaction (runes illuminate, crystals resonate, ground dust particles kick up on landing).

### 8. Run-and-Inspect Verification
- **Automated View Verification:** Inspect live rendered frames via browser capture or headless playtest.
- **Sanity Checklist:**
  - Are shadows rendering properly without acne or bias artifacts?
  - Are draw calls under budget (< 150 draw calls for web)?
  - Is frame rate locked at smooth 60 FPS?
  - Do characters sit naturally on terrain without clipping or floating?

### 9. Post-Processing & Visual Polish
- **Selective Bloom:** Threshold `0.85 - 1.0`, radius `0.6` — creates an ethereal halo around glowing aether runes without blurring the entire scene.
- **Ambient Occlusion (SSAO / N8AO):** Adds soft, dark contact shadows in rock crevices, under character boots, and beneath stone steps.
- **Tone Mapping:** `ACESFilmicToneMapping` or `AgX` to preserve highlight detail in bright glowing magic.

### 10. Honest Quality Audit
- Document model polycount, texture memory usage, and asset origins.
- Verify that gameplay collision hulls match visual geometry cleanly.

---

## Technical Stack Guidelines (Three.js & React Three Fiber)

```typescript
// Standard Cinematic Lighting Setup
<ambientLight intensity={0.4} color="#5C7A99" />
<hemisphereLight skyColor="#7CA6CC" groundColor="#1A202C" intensity={0.6} />
<directionalLight
  position={[30, 45, 20]}
  intensity={2.2}
  color="#FFF0D4"
  castShadow
  shadow-mapSize={[2048, 2048]}
  shadow-camera-near={0.5}
  shadow-camera-far={120}
  shadow-camera-left={-30}
  shadow-camera-right={30}
  shadow-camera-top={30}
  shadow-camera-bottom={-30}
  shadow-bias={-0.0003}
/>
```
