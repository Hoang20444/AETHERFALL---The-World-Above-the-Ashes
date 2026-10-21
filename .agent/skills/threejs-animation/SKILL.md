---
name: threejs-animation
description: Advanced Three.js skeletal animation, AnimationMixer state machines, cross-fades, bone socket attachment, and additive layers.
---

# Three.js Animation Pipeline

`threejs-animation` guides the agent through professional implementation of character animation in Three.js and React Three Fiber.

---

## 1. Skinned Mesh & Skeleton Cloning

When importing GLTF models with skeletal armatures:
- Standard `scene.clone()` breaks bone bindings and weight matrices.
- **ALWAYS** use `SkeletonUtils.clone(scene)` to duplicate SkinnedMesh and Armature nodes while cloning bone references properly.

```typescript
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const clone = useMemo(() => {
  const c = SkeletonUtils.clone(scene);
  c.traverse((child) => {
    if ((child as Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return c;
}, [scene]);
```

---

## 2. Animation State Machine & Blending

### Standard CrossFade Recipe
```typescript
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';

const { actions, mixer } = useAnimations(animations, clone);
const currentAction = useRef<string>('');

function playAnimation(name: string, duration: number = 0.2) {
  if (currentAction.current === name || !actions[name]) return;

  const prevAction = currentAction.current ? actions[currentAction.current] : null;
  const nextAction = actions[name]!;

  nextAction.reset();
  nextAction.enabled = true;
  nextAction.setEffectiveTimeScale(1);
  nextAction.setEffectiveWeight(1);

  if (prevAction) {
    nextAction.crossFadeFrom(prevAction, duration, true);
  }

  nextAction.play();
  currentAction.current = name;
}
```

### One-Shot Actions (Jump, Dash, Attack, Land)
Configure actions to stop on final frame or trigger callback:
```typescript
const jumpAction = actions['Kael_Jump']!;
jumpAction.setLoop(THREE.LoopOnce, 1);
jumpAction.clampWhenFinished = true;

mixer.addEventListener('finished', (e) => {
  if (e.action === jumpAction) {
    playAnimation('Kael_Fall', 0.15);
  }
});
```

---

## 3. Bone Sockets (Attaching Items to Character)

To attach weapons, magical relics, satchels, or lanterns to a character's hand or hip:
1. Locate target bone in the cloned hierarchy:
```typescript
const handBone = useMemo(() => {
  let bone: THREE.Bone | null = null;
  clone.traverse((node) => {
    if (node.type === 'Bone' && node.name === 'Hand.R') {
      bone = node as THREE.Bone;
    }
  });
  return bone;
}, [clone]);
```
2. Parent the prop mesh or light directly to the bone:
```typescript
useEffect(() => {
  if (!handBone || !propRef.current) return;
  handBone.add(propRef.current);
  return () => {
    handBone.remove(propRef.current!);
  };
}, [handBone]);
```

---

## 4. Layered / Additive Upper-Body Animations
- Isolate bone tracks in `AnimationClip.tracks`:
  - Separate `UpperBody` tracks (Chest, Arms, Head) from `LowerBody` tracks (Hips, Legs, Feet).
  - Allows character to run forward (`Kael_Run` on lower body) while simultaneously casting an Aether blast (`Kael_Cast` on upper body).
