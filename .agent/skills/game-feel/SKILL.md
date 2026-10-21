---
name: game-feel
description: Principles, formulas, and implementation recipes for responsive gameplay feedback, juice, screen shake, squash & stretch, input buffering, and kinetic polish.
---

# Game Feel & Juice (Kinetic Polish)

`game-feel` equips the agent with design principles, math formulas, and code implementations that transform rigid mechanical gameplay into juicy, responsive, and tactile gameplay.

---

## 1. Input Buffering & Forgiveness (Platforming Feel)

### Coyote Time
- Allow the player to jump for a brief window (`0.10s - 0.15s` / 6–9 frames at 60 FPS) *after* walking off the edge of a platform.
- Eliminates frustrating "I pressed jump right before falling" deaths.
```typescript
if (isGrounded) {
  coyoteTimer = 0.12; // Reset window
} else {
  coyoteTimer -= dt;
}
const canJump = isGrounded || coyoteTimer > 0;
```

### Jump Input Buffering
- If the player presses Jump while still airborne (within `0.15s` of hitting the ground), record the input and execute the jump the exact frame they land.
```typescript
if (input.jumpJustPressed) {
  jumpBufferTimer = 0.15;
} else {
  jumpBufferTimer -= dt;
}
if (isGrounded && jumpBufferTimer > 0) {
  executeJump();
  jumpBufferTimer = 0;
}
```

### Variable Jump Height
- When the player releases the jump key early, cut vertical velocity in half (`vy *= 0.5`) to allow low hops vs. full high leaps.

---

## 2. Squash & Stretch (Anatomy of Anticipation)

Kinetic feedback must deform the character mesh momentarily along the vertical axis without altering collision hulls:

1. **Jump Anticipation (Windup):**
   - Scale Y: `0.85`, Scale X/Z: `1.08` for 2–3 frames right before liftoff.
2. **Liftoff & Ascent (Stretch):**
   - Scale Y: `1.15`, Scale X/Z: `0.92` during peak vertical speed.
3. **Apex (Floating):**
   - Scale Y: `1.0`, Scale X/Z: `1.0` as vertical velocity approaches 0.
4. **Landing Impact (Squash):**
   - Scale Y: `0.78 - 0.88` proportional to falling speed, Scale X/Z: `1.08 - 1.15`.
   - Recover back to `(1, 1, 1)` smoothly using exponential damping:
```typescript
group.scale.y += (targetScaleY - group.scale.y) * (1 - Math.exp(-24 * dt));
group.scale.x += (targetScaleXZ - group.scale.x) * (1 - Math.exp(-24 * dt));
group.scale.z = group.scale.x;
```

---

## 3. Screen Shake (Trauma System)

Never use raw linear random noise. Use a non-linear quadratic **Trauma** model:
- `Trauma` is a value from `0.0` to `1.0`.
- Shake intensity = `Trauma * Trauma` (or `Trauma ^ 3`).
- Trauma decays linearly over time (`trauma = Math.max(trauma - decayRate * dt, 0)`).

```typescript
export class ScreenShake {
  private trauma = 0;

  addTrauma(amount: number) {
    this.trauma = Math.min(this.trauma + amount, 1.0);
  }

  update(dt: number, camera: THREE.Camera, time: number) {
    if (this.trauma <= 0) return;

    const shake = this.trauma * this.trauma;
    const yaw = Math.sin(time * 35) * 0.04 * shake;
    const pitch = Math.cos(time * 42) * 0.04 * shake;
    const roll = Math.sin(time * 28) * 0.02 * shake;

    camera.rotation.z += roll;
    camera.rotation.x += pitch;
    camera.rotation.y += yaw;

    this.trauma = Math.max(0, this.trauma - 1.6 * dt);
  }
}
```

---

## 4. Athletic Turning & Banking
- When changing horizontal direction sharply, apply bank angle along the local Z-axis (roll) and forward pitch (lean into the turn).
- Max lean angle: `0.12 - 0.18 rad` at sprint speeds.

---

## 5. Hit-Stop & Time Dilation
- On landing from a huge fall or executing an Aether Dash, freeze character pose for 2 frames (`33ms`) to give substantial weight and punch to the action.
