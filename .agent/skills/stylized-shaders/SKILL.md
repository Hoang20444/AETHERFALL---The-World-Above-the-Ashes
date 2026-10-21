---
name: stylized-shaders
description: Custom GLSL and TSL shader recipes for stylized fantasy aesthetics, including glowing runes, waterfalls, energy shields, and depth-based dissolve effects.
---

# Stylized Shaders & Visual Effects

`stylized-shaders` provides modern shader architecture, GLSL formulas, and implementation templates for stylized fantasy games in Three.js and React Three Fiber.

---

## 1. Flowing Stylized Waterfall & River Shader

Key principles:
- **Two-phase UV scrolling:** Scroll primary and secondary texture coordinates at slightly different speeds and angles to avoid repetitive tile lines.
- **Foam crest threshold:** Create crisp, cartoonish foam bands using `step()` or `smoothstep()` on a Simplex noise texture.

```glsl
// Fragment Shader snippet
uniform float uTime;
uniform vec3 uWaterColor;
uniform vec3 uFoamColor;
varying vec2 vUv;

void main() {
  vec2 uv1 = vUv * vec2(2.0, 6.0) + vec2(0.0, uTime * 1.2);
  vec2 uv2 = vUv * vec2(1.5, 4.0) - vec2(0.05, uTime * 0.85);

  float flowNoise = sin(uv1.y * 12.0 + uv1.x * 6.0) * cos(uv2.y * 10.0);
  float foamEdge = smoothstep(0.45, 0.65, flowNoise);

  vec3 finalColor = mix(uWaterColor, uFoamColor, foamEdge);
  gl_FragColor = vec4(finalColor, 0.85 + foamEdge * 0.15);
}
```

---

## 2. Pulsating Aether Rune Shader (Fresnel + Emission)

To give ancient monoliths and waystones magical glowing rune channels:
- Use **Fresnel reflection** to highlight edges when viewed at grazing angles.
- Modulate emission with a breathing sine wave.

```glsl
uniform float uTime;
uniform vec3 uGlowColor;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Fresnel calculation: (1 - dot(N, V))^power
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

  // Breathing pulse
  float pulse = 0.8 + 0.2 * sin(uTime * 2.5);

  vec3 emissive = uGlowColor * (fresnel * 1.5 + pulse * 0.8);
  gl_FragColor = vec4(emissive, 1.0);
}
```

---

## 3. Dissolve / Waystone Activation Shader

For teleportation effects, dissolving debris, or activating ancient monuments:
- Use a 3D noise texture mapped to world position.
- Discard pixels below `uDissolveThreshold`.
- Apply a bright glowing molten/aether edge where `noiseValue` is near the threshold.

```glsl
uniform float uThreshold; // 0.0 (fully visible) to 1.0 (fully dissolved)
uniform vec3 uEdgeColor;  // Vibrant cyan or gold
varying vec2 vUv;

void main() {
  float noise = texture2D(uNoiseMap, vUv * 3.0).r;
  if (noise < uThreshold) {
    discard;
  }

  // Edge burn width
  float edge = 1.0 - smoothstep(uThreshold, uThreshold + 0.06, noise);
  vec3 col = mix(baseColor.rgb, uEdgeColor * 4.0, edge);
  gl_FragColor = vec4(col, 1.0);
}
```

---

## 4. Performance Standards for Web Shaders
- Minimize costly transcendental functions (`pow`, `exp`, `sin`) in fragment loops.
- Pass precalculated variables from vertex shader whenever possible.
- Avoid branching (`if / else`); use `step()`, `clamp()`, and `mix()`.
