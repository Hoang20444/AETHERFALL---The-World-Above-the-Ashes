---
name: game-audio-sfx
description: Web Audio API sound design, spatial 3D audio, procedural SFX synthesis, footstep systems, and dynamic audio management for browser games.
---

# Game Audio & Spatial SFX

`game-audio-sfx` provides the runtime audio architecture, 3D spatial positioning, and procedural sound synthesis techniques needed for immersive game audio without bulky external files.

---

## 1. Web Audio Manager Architecture

### Audio Bus Structure
```text
AudioContext
├── MasterGainNode
    ├── MusicGainNode (BGM)
    ├── AmbientGainNode (Wind, waterfall, distant thunder)
    └── SfxGainNode (Footsteps, jumps, aether hum, UI clicks)
```

### User Gesture Unlock
Web Audio contexts are suspended until the first user interaction (click, keydown):
```typescript
class SoundSystem {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      const resume = () => {
        this.ctx?.resume();
        window.removeEventListener('click', resume);
        window.removeEventListener('keydown', resume);
      };
      window.addEventListener('click', resume);
      window.addEventListener('keydown', resume);
    }
  }
}
```

---

## 2. Procedural Sound Synthesis (Zero-Asset SFX)

Synthesize crisp, responsive sounds directly via Web Audio oscillators and noise buffers without loading external MP3/WAV files:

### A. Crisp Stone Footstep
```typescript
playFootstep(surface: 'stone' | 'grass' | 'wood') {
  if (!this.ctx) return;
  const now = this.ctx.currentTime;

  // Tiny noise burst for shoe grit + low frequency thud
  const osc = this.ctx.createOscillator();
  const gain = this.ctx.createGain();

  // Pitch randomization to prevent repetition fatigue
  const detune = (Math.random() - 0.5) * 80;
  osc.frequency.setValueAtTime(140 + detune, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(this.sfxGain);

  osc.start(now);
  osc.stop(now + 0.09);
}
```

### B. Aether Jump / Whoosh
```typescript
playJump() {
  if (!this.ctx) return;
  const now = this.ctx.currentTime;
  const osc = this.ctx.createOscillator();
  const gain = this.ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.22); // Rising whoosh

  gain.gain.setValueAtTime(0.28, now);
  gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(this.sfxGain);

  osc.start(now);
  osc.stop(now + 0.26);
}
```

### C. Aether Core Hum (3D Spatial Positional Audio)
```typescript
import * as THREE from 'three';

export function setupCoreHum(coreMesh: THREE.Object3D, listener: THREE.AudioListener) {
  const sound = new THREE.PositionalAudio(listener);
  // Generate low meditative resonant drone (110 Hz + 220 Hz harmonic)
  sound.setRefDistance(4);
  sound.setMaxDistance(35);
  sound.setRolloffFactor(1.5);
  coreMesh.add(sound);
}
```

---

## 3. Audio Fatigue Prevention Rules
1. **Never play the exact same pitch twice:** Apply `±3% - 6%` random pitch detuning on every footstep and jump.
2. **Minimum Trigger Interval:** Throttle footsteps to minimum `0.28s` interval regardless of animation speed.
3. **Volume Ducking:** During pause menu or cinematic moments, drop SFX and Music buses by `-6dB` and apply a low-pass filter (`frequency: 800Hz`).
