# AETHERFALL — Master 3D Asset Manifest

## Pipeline Standards
- **Coordinate System:** Blender metric (+Z Up, -Y Forward) exported as glTF/GLB (+Y Up, +Z Forward).
- **Origin Policy:** 
  - Environment / Architecture / Rocks: Bottom center of geometry (ground contact at `Z=0`).
  - Characters / Creatures: Ground contact between feet at `Z=0` (`Y=0` in runtime).
  - Floating items / Relics / Spires / Cores: Geometric center (`0, 0, 0`) for effortless rotational and floating animation.
- **Export Target:** `public/models/{category}/{asset_name}.glb`
- **Master Blend File:** `blender/AETHERFALL_AssetLibrary.blend`

---

## Asset Status Index

| Category | Asset ID / File Name | Blender Object | Dimensions (m) | Materials / Shader | Status | Integrated In Game |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Rock Kit** | `island_rock_large.glb` | `Rock_Island_Large` | 24.0 x 18.0 x 14.5 | PBR Rock Strata + Moss Cap | Completed & Exported | Yes (`Platforms.tsx`) |
| **Rock Kit** | `island_rock_medium.glb` | `Rock_Island_Medium` | 14.0 x 11.0 x 9.0 | PBR Rock Strata + Moss Cap | Completed & Exported | Yes (`Platforms.tsx`) |
| **Rock Kit** | `stepping_stone_cluster.glb` | `Stepping_Stone_Cluster` | 4.8 x 4.8 x 2.2 | Weathered Slate + Moss | Completed & Exported | Yes (`Platforms.tsx`) |
| **Rock Kit** | `floating_debris_pack.glb` | `Floating_Debris_Pack` | 3.5 x 3.5 x 2.8 | Shattered Basalt Crags + Cyan Vein | Completed & Exported | Yes (`Platforms.tsx`) |
| **Architecture** | `modular_pillar_fluted.glb` | `Arch_Pillar_Fluted` | 1.2 x 1.2 x 5.2 | Ancient Slate Masonry + Capital | Completed & Exported | Yes (`Platforms.tsx`) |
| **Architecture** | `modular_pillar_broken.glb` | `Arch_Pillar_Broken` | 1.2 x 1.2 x 2.8 | Fractured Column Top | Completed & Exported | Yes (`Platforms.tsx`) |
| **Architecture** | `archway_segment.glb` | `Archway_Segment` | 5.5 x 1.4 x 4.8 | Carved Keystone + Rib Vault | Completed & Exported | Yes (`Platforms.tsx`) |
| **Architecture** | `bridge_deck_straight.glb` | `Bridge_Deck_Straight` | 4.0 x 12.0 x 1.2 | Weathered Flagstone + Curbs | Completed & Exported | Yes (Asset Library) |
| **Architecture** | `bridge_deck_broken.glb` | `Bridge_Deck_Broken` | 4.0 x 8.0 x 1.6 | Severed Fracture Edge + Rubble | Completed & Exported | Yes (`Platforms.tsx`) |
| **Landmarks** | `ancient_monument_citadel.glb` | `Monument_Citadel_Hero` | 16.0 x 16.0 x 22.0 | Multi-tier Dais + Spires + Conduits | Completed & Exported | Yes (`AncientMonument.tsx`) |
| **Landmarks** | `aether_core_astral.glb` | `Aether_Core_Astral` | 4.2 x 4.2 x 4.2 | Cut-Gem Core + Triple Gyro Rings | Completed & Exported | Yes (`AncientMonument.tsx`) |
| **Props** | `waystone_checkpoint.glb` | `Waystone_Checkpoint` | 1.4 x 1.4 x 3.4 | Stepped Plinth + Runic Pillar + Gem | Completed & Exported | Yes (`Waystones.tsx`) |
| **Props** | `relic_pedestal.glb` | `Relic_Pedestal` | 1.2 x 1.2 x 1.8 | Carved Gold Inlay Pedestal + Shard | Completed & Exported | Yes (Asset Library) |
| **Character** | `kael.glb` | `Kael_Hero` + `Kael_Armature` | 0.8 x 0.6 x 1.75 | 8 PBR Mats + 20 Bones + 6 NLA Clips | Completed & Exported | Yes (`PlayerAvatar.tsx`) |

---

## 3. Master Blender Scene
- **File:** `blender/AETHERFALL_AssetLibrary.blend`
- **Total Objects:** 14 handcrafted models
- **PBR Shader Network:** Blender Principled BSDF compatible with glTF 2.0 PBR spec
- **Character Rig:** Complete standard humanoid hierarchy (<64 bones, 100% vertex skin weights, rest pose facing -Y)
- **NLA Tracks / Animation Clips:** `Kael_Idle`, `Kael_Run`, `Kael_Jump`, `Kael_Fall`, `Kael_Land`, `Kael_AetherDash`
