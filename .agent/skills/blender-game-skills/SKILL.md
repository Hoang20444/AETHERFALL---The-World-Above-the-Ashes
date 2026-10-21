---
name: blender-game-skills
description: Game asset production pipeline for Blender. Transforms 2D concept art, reference sheets, and design briefs into game-ready, rigged, textured 3D assets and clean GLB/GLTF models.
---

# Blender Game Skills

`blender-game-skills` guides the agent through an automated, production-grade 3D game asset pipeline inside Blender. It ensures models are scaled properly, cleanly topologized, correctly textured with PBR materials, properly rigged with standard bone hierarchies, and exported efficiently for web/game engines (Three.js, Unity, Unreal, Godot).

---

## Game Asset Production Pipeline

### Phase 1: Reference Analysis & Scale Calibration
1. **Analyze Design Brief / Concept Art:**
   - Determine asset category: Character, Architecture, Landmark, Prop, or Environment Rock/Terrain.
   - Establish bounding dimensions (e.g. Character height = `1.8m`, Citadel height = `15.0m`, Pillar radius = `1.2m`).
2. **Unit Setup in Blender:**
   - Ensure Blender scene uses Metric units with Unit Scale = `1.0`.
   - Set object origins at the base of the model (`Z = 0`) where it contacts the ground/platform.

### Phase 2: Blockout & Topology
1. **Primitive Blocking:**
   - Construct primary volumes using primitive shapes (cubes, cylinders, spheres).
   - Check proportions and silhouette before joining or sculpting.
2. **Edge Flow & Bevels:**
   - Avoid razor-sharp 90-degree edges on architecture and hard surfaces. Apply `Bevel` modifiers (`width=0.08m`, `segments=2`) or chiseled chamfers.
   - For organic shapes (characters, rocks), use Subdivision Surface (`levels=1-2`) followed by smooth shading (`mesh.shade_smooth()`).
   - Enable Auto Smooth (`use_auto_smooth = True`, angle `30° - 45°`) or weighted normals to keep flat surfaces flat while rounding bevels.
3. **Budget Targets:**
   - Hero Character: 3,000 – 12,000 triangles.
   - Major Landmark / Citadel: 5,000 – 20,000 triangles.
   - Environment Rocks & Props: 400 – 2,500 triangles each.

### Phase 3: PBR Materials & Shading
1. **Node Tree Standard:**
   - Always connect to a `Principled BSDF` node routed to `Material Output`.
   - Configure key channels:
     - `Base Color`: Clean, harmonious palette with slight color gradient or hand-painted feel.
     - `Roughness`: `0.7 - 0.9` for weathered stone/rock; `0.3 - 0.5` for polished metal/leather.
     - `Metallic`: `0.0` for stone/cloth; `0.8 - 1.0` for ancient gold/brass runes.
     - `Emission Color & Strength`: For glowing Aether elements, use vibrant cyan (`#00F0FF`, strength `3.0 - 8.0`).
2. **Procedural Noise / Tileable Mapping:**
   - For procedural materials, combine `Texture Coordinate (Object/Generated)` -> `Mapping` -> `Noise Texture` -> `ColorRamp` into Base Color / Roughness to avoid repetitiveness.

### Phase 4: Rigging & Skinning (Humanoid Characters)
1. **Armature Hierarchy Standard:**
   ```text
   Root
   └── Hips
       ├── Spine -> Chest -> Neck -> Head
       ├── UpperLeg_L -> LowerLeg_L -> Foot_L -> Toe_L
       ├── UpperLeg_R -> LowerLeg_R -> Foot_R -> Toe_R
       ├── Shoulder_L -> UpperArm_L -> LowerArm_L -> Hand_L
       └── Shoulder_R -> UpperArm_R -> LowerArm_R -> Hand_R
   ```
2. **Bone Orientation & Roll:**
   - Ensure bone Y-axis points along the length of each limb.
   - Apply all transforms (`Ctrl+A` -> Rotation & Scale) on both mesh and armature before parenting.
3. **Weight Painting & Deform Check:**
   - Every vertex in a deformable character mesh must have at least one vertex group weight > `0.0`.
   - Ensure maximum 4 bone influences per vertex for web/glTF standard compliance.
   - Prevent tearing between torso and limbs by painting smooth transition gradients.

### Phase 5: Exporting Game-Ready GLTF/GLB
Execute programmatic export with exact settings:
```python
bpy.ops.export_scene.gltf(
    filepath="path/to/asset.glb",
    export_format='GLB',
    use_selection=True,                # Only export designated collection or object
    export_apply=True,                   # Apply all modifiers (Bevel, Subsurf)
    export_colors=True,                  # Export vertex colors
    export_materials='EXPORT',           # Pack PBR materials
    export_cameras=False,                # Exclude Blender scene cameras
    export_lights=False,                 # Exclude Blender scene lights
    export_yup=True,                     # Three.js uses Y-up standard
    export_skins=True,                   # Export armature and vertex weights
    export_morph=False,
    export_animations=True               # Export NLA tracks and actions
)
```

### Phase 6: Automated Verification Checklist
- [ ] Scale is `(1.0, 1.0, 1.0)` on mesh and armature.
- [ ] Rotation is `(0.0, 0.0, 0.0)` applied.
- [ ] Pivot point / Origin is at bottom center of the asset.
- [ ] File size is optimized (< 2MB per prop, < 5MB per major character/landmark).
- [ ] No unweighted floating vertices in skinned meshes.
- [ ] Mesh normals are oriented outward (no flipped face normals).
