# AETHERFALL — The World Above the Ashes

> **A third-person stylized fantasy action-adventure game built with React, Three.js, React Three Fiber, Blender, and TypeScript.**

---

## 🌌 Overview

The world consists of ancient floating archipelagos sustained by mysterious structures known as the **Seven Pillars**. When an event called **"The Falling"** causes islands to collapse into the abyss below, **Kael**, an agile courier and messenger, embarks on a perilous journey across crumbling bridges and forgotten ruins to reach the **Ancient Monument** and stabilize the **Aether Core**.

---

## ✨ Features & Architecture

- **🎮 Third-Person Character Controller**:
  - Smooth orbital camera with spring-arm terrain collision avoidance.
  - Kinematic platforming physics with Coyote Time, Jump Input Buffering, and variable jump height.
  - Athletic turning, roll banking, and landing squash & stretch kinetic feedback.
- **🏛️ Handcrafted 3D Asset Pipeline**:
  - Original 3D models created in **Blender 5.2 LTS** (`AETHERFALL_AssetLibrary.blend`).
  - Hero character **Kael** with 20-bone humanoid armature, cowl/scarf, and stylized fantasy proportions.
  - Ancient Monument Citadel, glowing Waystone checkpoints, archways, and stratified island cliffs.
- **💎 Cinematic Post-Processing Pipeline**:
  - **Unreal Bloom**: Luminous ethereal cyan halos for Aether Cores and runic channels.
  - **N8AO (Contact Ambient Occlusion)**: Soft, realistic contact shadowing in stone crevices and under footings.
  - **ACES Filmic Tone Mapping & Vignette**: Color-balanced dynamic range avoiding clipped highlights.
  - **Magical Aether Sparkles**: Floating motes and dust particles drifting through the sky world.
- **🤖 Integrated AI Agent Skills**:
  - Built-in `.agent/skills/` suite supporting `3dviz-pro-max`, `blender-game-skills`, `threejs-game-skills`, `game-feel`, `threejs-animation`, `stylized-shaders`, `game-audio-sfx`, and `ui-ux-pro-max`.

---

## 🕹️ Controls

| Key | Action |
| :--- | :--- |
| **W, A, S, D** | Move Kael |
| **Space** | Jump |
| **Shift** | Sprint |
| **Left / Right Mouse Drag** | Orbit Camera |
| **Escape** | Pause / Resume Menu |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Blender (v4.2+ or v5.x LTS for source `.blend` asset editing)

### Installation
```bash
# Clone the repository
git clone git@github.com:<your-username>/AETHERFALL.git

# Navigate to project directory
cd AETHERFALL

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser to play!

### Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```text
├── .agent/skills/       # Agent skills (3D viz, Blender pipeline, Shaders, SFX)
├── blender/             # Source Blender master asset libraries & backups (.blend)
├── docs/                # Architecture manifests & documentation
├── public/
│   ├── models/          # Optimized game-ready GLB models (characters, landmarks, props)
│   └── textures/        # PBR procedural stone and environmental textures
├── src/
│   ├── game/
│   │   ├── player/      # Character controller, camera rig, avatar rendering
│   │   ├── systems/     # Post-processing, game state, input handling
│   │   ├── world/       # Level data, platforms, ancient monument, lighting
│   │   └── GameScene.tsx# Main Three.js Canvas orchestration
│   ├── ui/              # HUD, objective trackers, pause screens
│   └── App.tsx
└── vite.config.ts
```

---

## 📜 License
MIT License. Created with ❤️ for stylized web gaming.
